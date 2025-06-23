<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class AuthService
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

        /**
     * Inicia sesión con correo y contraseña
     */
    public function iniciarSesion($correo, $password)
    {
        try {
            // Manejo seguro de sesión
            $this->startSessionIfNotStarted();

            // Buscar persona por correo
            $stmt = $this->conn->prepare("
                SELECT p.*, c.id_cliente 
                FROM Persona p
                LEFT JOIN Cliente c ON p.id_persona = c.id_persona
                WHERE p.correo = ?
            ");
            $stmt->execute([$correo]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$usuario) {
                throw new Exception("Correo o contraseña incorrectos");
            }

            // Verificar contraseña (en un sistema real aquí verificarías el hash)
            // Esto es solo un ejemplo - en producción usa password_verify()
            if (!password_verify($password, $usuario['password'])) {
                throw new Exception("Correo o contraseña incorrectos");
            }

            // Crear sesión (en un API REST usaríamos tokens JWT)
            $_SESSION['usuario'] = [
                'id' => $usuario['id_persona'],
                'cliente_id' => $usuario['id_cliente'],
                'nombres' => $usuario['nombres'],
                'apellidos' => $usuario['apellidos'],
                'correo' => $usuario['correo'],
                'tipo_documento' => $usuario['id_tipo_documento'],
                'numero_documento' => $usuario['numero_documento']
            ];

            return [
                'success' => true,
                'usuario' => $_SESSION['usuario'],
                'message' => 'Inicio de sesión exitoso.'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Registra un nuevo cliente en el sistema
     */
    public function registrarCliente($datos) {
        // Registrar intento
        error_log("Intento de registro: " . ($datos['correo'] ?? 'sin email'));
        
        // Iniciar transacción
        $this->conn->beginTransaction();
        
        try {
            // Validaciones mejoradas
            $this->validarDatosRegistro($datos);
    
            // Verificar unicidad
            $this->verificarUnicidad($datos['correo'], $datos['numero_documento'], $datos['id_tipo_documento']);
    
            // Insertar dirección
            $id_direccion = $this->insertarDireccion(
                $datos['region'],
                $datos['provincia'],
                $datos['distrito'],
                $datos['direccion_detallada']
            );
    
            // Insertar persona
            $id_persona = $this->insertarPersona($datos, $id_direccion);
    
            // Insertar cliente
            $id_cliente = $this->insertarCliente($id_persona);
    
            // Confirmar transacción
            $this->conn->commit();
         
            return [
                'success' => true,
                'message' => 'Registro exitoso. Inicie sesión con los datos registrados.',
                'cliente_id' => $id_cliente
            ];
    
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            
            error_log("Error en registro: " . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }


    // Métodos auxiliares:

    private function validarDatosRegistro($datos)
    {
        $required = [
            'nombres',
            'apellidos',
            'id_tipo_documento',
            'numero_documento',
            'fecha_nacimiento',
            'telefono',
            'correo',
            'password',
            'region',
            'provincia',
            'distrito',
            'direccion_detallada'
        ];

        foreach ($required as $field) {
            if (empty($datos[$field])) {
                throw new Exception("El campo $field es requerido");
            }
        }

        $this->validarTipoDocumento($datos['id_tipo_documento'], $datos['numero_documento']);
        $this->validarTelefono($datos['telefono']);
        $this->validarMayoriaEdad($datos['fecha_nacimiento']);

        if (strlen($datos['password']) < 8) {
            throw new Exception("La contraseña debe tener al menos 8 caracteres");
        }

        if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("El formato del correo electrónico no es válido");
        }

        if (!is_numeric($datos['id_tipo_documento'])) {
            throw new Exception("Tipo de documento inválido");
        }
    }

    private function validarMayoriaEdad($fechaNacimiento) {
        $fechaNac = new DateTime($fechaNacimiento);
        $hoy = new DateTime();
        $edad = $hoy->diff($fechaNac)->y;
        
        if ($edad < 18) {
            throw new Exception("Debes tener al menos 18 años para registrarte");
        }
        
        // Opcional: Validar que la fecha no sea en el futuro
        if ($fechaNac > $hoy) {
            throw new Exception("La fecha de nacimiento no puede ser futura");
        }
    }

    private function validarTelefono($telefono) {
        // Eliminar espacios, guiones y el prefijo +51 si existe
        $numero = preg_replace('/[^0-9]/', '', $telefono);
        $numero = str_replace('+51', '', $numero);
        $numero = str_replace('51', '', $numero);
        
        // Validar longitud (9 dígitos para Perú)
        if (!preg_match('/^9[0-9]{8}$/', $numero)) {
            throw new Exception("El número de teléfono debe tener 9 dígitos y comenzar con 9");
        }
    }

    private function validarTipoDocumento($id_tipo_documento, $numero_documento) {
        // Eliminar espacios y guiones
        $numero = preg_replace('/[^0-9]/', '', $numero_documento);
        
        switch ($id_tipo_documento) {
            case 1: // DNI (Perú)
                if (!preg_match('/^[0-9]{8}$/', $numero)) {
                    throw new Exception("El DNI debe tener 8 dígitos numéricos");
                }
                break;
                
            case 2: // Carnet de Extranjería
                if (!preg_match('/^[A-Z0-9]{6,12}$/', $numero_documento)) {
                    throw new Exception("El Carnet de Extranjería debe tener entre 6 y 12 caracteres alfanuméricos");
                }
                break;
                
            case 3: // Pasaporte
                if (!preg_match('/^[A-Z0-9]{6,12}$/', $numero_documento)) {
                    throw new Exception("El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos");
                }
                break;
                
            case 4: // RUC
                if (!preg_match('/^[0-9]{11}$/', $numero)) {
                    throw new Exception("El RUC debe tener 11 dígitos numéricos");
                }
                break;
                
            default:
                throw new Exception("Tipo de documento no válido");
        }
    }

    private function verificarUnicidad($correo, $numero_documento, $id_tipo_documento)
    {
        $stmt = $this->conn->prepare("SELECT id_persona FROM Persona WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("El correo electrónico ya está registrado");
        }

        $stmt = $this->conn->prepare("SELECT id_persona FROM Persona WHERE numero_documento = ? AND id_tipo_documento = ?");
        $stmt->execute([$numero_documento, $id_tipo_documento]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("El número de documento ya está registrado para este tipo de documento");
        }
    }

    private function insertarDireccion($region, $provincia, $distrito, $direccion)
    {
        $stmt = $this->conn->prepare("
        INSERT INTO Direccion (region, provincia, distrito, direccion_detallada) 
        VALUES (?, ?, ?, ?) RETURNING id_direccion
    ");
        $stmt->execute([$region, $provincia, $distrito, $direccion]);
        return $stmt->fetch(PDO::FETCH_ASSOC)['id_direccion'];
    }

    private function insertarPersona($datos, $id_direccion)
    {
        $hashedPassword = password_hash($datos['password'], PASSWORD_BCRYPT);

        $stmt = $this->conn->prepare("
        INSERT INTO Persona (
            nombres, apellidos, id_tipo_documento, numero_documento, 
            telefono, correo, password, fecha_nacimiento, id_direccion, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        RETURNING id_persona
    ");

        $stmt->execute([
            $datos['nombres'],
            $datos['apellidos'],
            $datos['id_tipo_documento'],
            $datos['numero_documento'],
            $datos['telefono'],
            $datos['correo'],
            $hashedPassword,
            $datos['fecha_nacimiento'] ?? null,
            $id_direccion
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC)['id_persona'];
    }

    private function insertarCliente($id_persona)
    {
        $stmt = $this->conn->prepare("
        INSERT INTO Cliente (id_persona) 
        VALUES (?)
        RETURNING id_cliente
    ");
        $stmt->execute([$id_persona]);
        return $stmt->fetch(PDO::FETCH_ASSOC)['id_cliente'];
    }

    /**
     * Verifica si hay una sesión activa
     */
    public function verificarSesion()
    {
        // Iniciar sesión solo si no está activa
        $this->startSessionIfNotStarted();

        if (isset($_SESSION['usuario'])) {
            return [
                'success' => true,
                'usuario' => $_SESSION['usuario'],
                'session_id' => session_id(),
                'session_status' => session_status()
            ];
        }

        return [
            'success' => false,
            'session_id' => session_id(),
            'session_status' => session_status()
        ];
    }

    /**
     * Cierra la sesión actual
     */
    public function cerrarSesion()
    {
        session_start();
        session_unset();
        session_destroy();
        return ['success' => true];
    }
    private function startSessionIfNotStarted()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'cookie_lifetime' => 86400, // 1 día
                'cookie_secure' => true, // Solo en HTTPS
                'cookie_httponly' => true, // Accesible solo por HTTP
                'use_strict_mode' => true
            ]);
        }
    }
}
