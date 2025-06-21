<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class AuthService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Registra un nuevo cliente en el sistema
     */
    public function registrarCliente($datos) {
        // Iniciar transacción AL PRINCIPIO
        $this->conn->beginTransaction();
        
        try {
            // Validar datos requeridos
            $required = ['nombres', 'apellidos', 'id_tipo_documento', 'numero_documento', 
                        'telefono', 'correo', 'password', 'region', 'provincia', 
                        'distrito', 'direccion_detallada'];
            
            foreach ($required as $field) {
                if (empty($datos[$field])) {
                    throw new Exception("El campo $field es requerido");
                }
            }
    
            // Verificar si el correo ya existe (DENTRO de la transacción)
            $stmt = $this->conn->prepare("SELECT id_persona FROM Persona WHERE correo = ?");
            $stmt->execute([$datos['correo']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("El correo electrónico ya está registrado");
            }
    
            // Verificar si el documento ya existe (DENTRO de la transacción)
            $stmt = $this->conn->prepare("SELECT id_persona FROM Persona WHERE numero_documento = ? AND id_tipo_documento = ?");
            $stmt->execute([$datos['numero_documento'], $datos['id_tipo_documento']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("El número de documento ya está registrado para este tipo de documento");
            }
    
            // 1. Insertar dirección
            $stmt = $this->conn->prepare("
                INSERT INTO Direccion (region, provincia, distrito, direccion_detallada) 
                VALUES (?, ?, ?, ?) RETURNING id_direccion
            ");
            $stmt->execute([
                $datos['region'],
                $datos['provincia'],
                $datos['distrito'],
                $datos['direccion_detallada']
            ]);
            $id_direccion = $stmt->fetch(PDO::FETCH_ASSOC)['id_direccion'];
    
            // 2. Insertar persona
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
            $id_persona = $stmt->fetch(PDO::FETCH_ASSOC)['id_persona'];
    
            // 3. Insertar cliente
            $stmt = $this->conn->prepare("
                INSERT INTO Cliente (id_persona) 
                VALUES (?)
                RETURNING id_cliente
            ");
            $stmt->execute([$id_persona]);
            $id_cliente = $stmt->fetch(PDO::FETCH_ASSOC)['id_cliente'];
    
            // Confirmar transacción SI TODO SALE BIEN
            $this->conn->commit();
    
            return [
                'success' => true,
                'message' => 'Registro exitoso',
                'cliente_id' => $id_cliente
            ];
    
        } catch (Exception $e) {
            // Solo hacer rollback si la transacción está activa
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Inicia sesión con correo y contraseña
     */
    public function iniciarSesion($correo, $password) {
        try {
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
            session_start();
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
                'usuario' => $_SESSION['usuario']
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verifica si hay una sesión activa
     */
    public function verificarSesion() {
        session_start();
        if (isset($_SESSION['usuario'])) {
            return [
                'success' => true,
                'usuario' => $_SESSION['usuario']
            ];
        }
        return ['success' => false];
    }

    /**
     * Cierra la sesión actual
     */
    public function cerrarSesion() {
        session_start();
        session_unset();
        session_destroy();
        return ['success' => true];
    }
}
?>