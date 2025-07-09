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
     * Inicia sesión y devuelve tipo de usuario (empleado o cliente)
     */
    public function iniciarSesion($correo, $password)
    {
        try {
            $this->startSessionIfNotStarted();

            // Buscar persona por correo con información de dirección
            $stmt = $this->conn->prepare("
                SELECT p.*,
                       c.id_cliente,
                       e.id_empleado,
                       pu.nombre AS puesto_nombre,
                       d.region,
                       d.provincia,
                       d.distrito,
                       d.direccion_detallada
                FROM Persona p
                LEFT JOIN Cliente c ON p.id_persona = c.id_persona
                LEFT JOIN Empleado e ON p.id_persona = e.id_persona
                LEFT JOIN Puesto pu ON e.id_puesto = pu.id_puesto
                LEFT JOIN Direccion d ON p.id_direccion = d.id_direccion
                WHERE p.correo = ?
            ");
            $stmt->execute([$correo]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$usuario) {
                throw new Exception("Correo o contraseña incorrectos");
            }

            if (!password_verify($password, $usuario['password'])) {
                throw new Exception("Correo o contraseña incorrectos");
            }

            // Determinar tipo de usuario
            $tipo = null;
            if (!empty($usuario['id_empleado'])) {
                $tipo = 'empleado';
            } elseif (!empty($usuario['id_cliente'])) {
                $tipo = 'cliente';
            }

            if (!$tipo) {
                throw new Exception("El usuario no está registrado como empleado ni como cliente");
            }

            $usuarioSesion = [
                'id' => $usuario['id_persona'],
                'nombres' => $usuario['nombres'],
                'apellidos' => $usuario['apellidos'],
                'correo' => $usuario['correo'],
                'telefono' => $usuario['telefono'],
                'fecha_nacimiento' => $usuario['fecha_nacimiento'],
                'tipo' => $tipo,
                'id_empleado' => $usuario['id_empleado'] ?? null,
                'puesto' => $usuario['puesto_nombre'] ?? null,
                'id_cliente' => $usuario['id_cliente'] ?? null,
                'direccion' => [
                    'region' => $usuario['region'] ?? '',
                    'provincia' => $usuario['provincia'] ?? '',
                    'distrito' => $usuario['distrito'] ?? '',
                    'direccion_detallada' => $usuario['direccion_detallada'] ?? ''
                ]
            ];

            $_SESSION['usuario'] = $usuarioSesion;

            return [
                'success' => true,
                'usuario' => $usuarioSesion,
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
     * Inicia sesión SOLO para empleados
     */
    public function iniciarSesionEmpleado($correo, $password)
    {
        try {
            $this->startSessionIfNotStarted();

            // Buscar persona y verificar si es empleado
            $stmt = $this->conn->prepare("
                SELECT p.*, e.id_empleado, pu.nombre AS puesto_nombre
                FROM Persona p
                INNER JOIN Empleado e ON p.id_persona = e.id_persona
                INNER JOIN Puesto pu ON e.id_puesto = pu.id_puesto
                WHERE p.correo = ?
            ");
            $stmt->execute([$correo]);
            $empleado = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$empleado) {
                throw new Exception("Solo los empleados pueden iniciar sesión en el panel de administración.");
            }

            if (!password_verify($password, $empleado['password'])) {
                throw new Exception("Correo o contraseña incorrectos");
            }

            $_SESSION['empleado'] = [
                'id' => $empleado['id_persona'],
                'id_empleado' => $empleado['id_empleado'],
                'nombres' => $empleado['nombres'],
                'apellidos' => $empleado['apellidos'],
                'correo' => $empleado['correo'],
                'puesto' => $empleado['puesto_nombre'],
            ];

            return [
                'success' => true,
                'empleado' => $_SESSION['empleado'],
                'message' => 'Inicio de sesión exitoso (empleado).'
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
            // Si la sesión ya tiene la información completa, la devolvemos
            if (isset($_SESSION['usuario']['direccion'])) {
                return [
                    'success' => true,
                    'usuario' => $_SESSION['usuario'],
                    'session_id' => session_id(),
                    'session_status' => session_status()
                ];
            }

            // Si la sesión no tiene la información completa, la actualizamos
            try {
                $id_persona = $_SESSION['usuario']['id'];
                
                $stmt = $this->conn->prepare("
                    SELECT p.*,
                           c.id_cliente,
                           e.id_empleado,
                           pu.nombre AS puesto_nombre,
                           d.region,
                           d.provincia,
                           d.distrito,
                           d.direccion_detallada
                    FROM Persona p
                    LEFT JOIN Cliente c ON p.id_persona = c.id_persona
                    LEFT JOIN Empleado e ON p.id_persona = e.id_persona
                    LEFT JOIN Puesto pu ON e.id_puesto = pu.id_puesto
                    LEFT JOIN Direccion d ON p.id_direccion = d.id_direccion
                    WHERE p.id_persona = ?
                ");
                $stmt->execute([$id_persona]);
                $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($usuario) {
                    // Determinar tipo de usuario
                    $tipo = null;
                    if (!empty($usuario['id_empleado'])) {
                        $tipo = 'empleado';
                    } elseif (!empty($usuario['id_cliente'])) {
                        $tipo = 'cliente';
                    }

                    $usuarioSesion = [
                        'id' => $usuario['id_persona'],
                        'nombres' => $usuario['nombres'],
                        'apellidos' => $usuario['apellidos'],
                        'correo' => $usuario['correo'],
                        'telefono' => $usuario['telefono'],
                        'fecha_nacimiento' => $usuario['fecha_nacimiento'],
                        'tipo' => $tipo,
                        'id_empleado' => $usuario['id_empleado'] ?? null,
                        'puesto' => $usuario['puesto_nombre'] ?? null,
                        'id_cliente' => $usuario['id_cliente'] ?? null,
                        'direccion' => [
                            'region' => $usuario['region'] ?? '',
                            'provincia' => $usuario['provincia'] ?? '',
                            'distrito' => $usuario['distrito'] ?? '',
                            'direccion_detallada' => $usuario['direccion_detallada'] ?? ''
                        ]
                    ];

                    $_SESSION['usuario'] = $usuarioSesion;

                    return [
                        'success' => true,
                        'usuario' => $usuarioSesion,
                        'session_id' => session_id(),
                        'session_status' => session_status()
                    ];
                }
            } catch (Exception $e) {
                error_log("Error al actualizar sesión con dirección: " . $e->getMessage());
            }

            // Si no se pudo actualizar, devolver la sesión actual
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

    /**
     * Actualiza el perfil del usuario autenticado
     */
    public function actualizarPerfil($datos) {
        try {
            $this->startSessionIfNotStarted();

            if (!isset($_SESSION['usuario'])) {
                throw new Exception("Usuario no autenticado");
            }

            $id_persona = $_SESSION['usuario']['id'];

            // Iniciar transacción
            $this->conn->beginTransaction();

            try {
                // Validar datos requeridos
                if (empty($datos['nombres']) || empty($datos['apellidos']) || empty($datos['correo'])) {
                    throw new Exception("Nombres, apellidos y correo son requeridos");
                }

                // Verificar que el correo no esté en uso por otro usuario
                $stmt = $this->conn->prepare("
                    SELECT id_persona FROM Persona 
                    WHERE correo = ? AND id_persona != ?
                ");
                $stmt->execute([$datos['correo'], $id_persona]);
                if ($stmt->rowCount() > 0) {
                    throw new Exception("El correo electrónico ya está en uso por otro usuario");
                }

                // Actualizar información de la persona
                $stmt = $this->conn->prepare("
                    UPDATE Persona 
                    SET nombres = ?, apellidos = ?, correo = ?, telefono = ?
                    WHERE id_persona = ?
                ");
                $stmt->execute([
                    $datos['nombres'],
                    $datos['apellidos'],
                    $datos['correo'],
                    $datos['telefono'] ?? null,
                    $id_persona
                ]);

                // Actualizar dirección si se proporciona
                if (isset($datos['direccion'])) {
                    $direccion = $datos['direccion'];
                    
                    // Obtener el id_direccion actual
                    $stmt = $this->conn->prepare("SELECT id_direccion FROM Persona WHERE id_persona = ?");
                    $stmt->execute([$id_persona]);
                    $id_direccion = $stmt->fetch(PDO::FETCH_ASSOC)['id_direccion'];

                    if ($id_direccion) {
                        // Actualizar dirección existente
                        $stmt = $this->conn->prepare("
                            UPDATE Direccion 
                            SET region = ?, provincia = ?, distrito = ?, direccion_detallada = ?
                            WHERE id_direccion = ?
                        ");
                        $stmt->execute([
                            $direccion['region'] ?? '',
                            $direccion['provincia'] ?? '',
                            $direccion['distrito'] ?? '',
                            $direccion['direccion_detallada'] ?? '',
                            $id_direccion
                        ]);
                    } else {
                        // Crear nueva dirección
                        $stmt = $this->conn->prepare("
                            INSERT INTO Direccion (region, provincia, distrito, direccion_detallada)
                            VALUES (?, ?, ?, ?)
                            RETURNING id_direccion
                        ");
                        $stmt->execute([
                            $direccion['region'] ?? '',
                            $direccion['provincia'] ?? '',
                            $direccion['distrito'] ?? '',
                            $direccion['direccion_detallada'] ?? ''
                        ]);
                        $id_direccion = $stmt->fetch(PDO::FETCH_ASSOC)['id_direccion'];

                        // Asignar la dirección a la persona
                        $stmt = $this->conn->prepare("
                            UPDATE Persona SET id_direccion = ? WHERE id_persona = ?
                        ");
                        $stmt->execute([$id_direccion, $id_persona]);
                    }
                }

                // Confirmar transacción
                $this->conn->commit();

                // Actualizar la sesión con los nuevos datos
                $this->actualizarSesionUsuario($id_persona);

                return [
                    'success' => true,
                    'message' => 'Perfil actualizado exitosamente'
                ];

            } catch (Exception $e) {
                $this->conn->rollBack();
                throw $e;
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Actualiza la sesión del usuario con los datos más recientes
     */
    private function actualizarSesionUsuario($id_persona) {
        $stmt = $this->conn->prepare("
            SELECT p.*,
                   c.id_cliente,
                   e.id_empleado,
                   pu.nombre AS puesto_nombre,
                   d.region,
                   d.provincia,
                   d.distrito,
                   d.direccion_detallada
            FROM Persona p
            LEFT JOIN Cliente c ON p.id_persona = c.id_persona
            LEFT JOIN Empleado e ON p.id_persona = e.id_persona
            LEFT JOIN Puesto pu ON e.id_puesto = pu.id_puesto
            LEFT JOIN Direccion d ON p.id_direccion = d.id_direccion
            WHERE p.id_persona = ?
        ");
        $stmt->execute([$id_persona]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            // Determinar tipo de usuario
            $tipo = null;
            if (!empty($usuario['id_empleado'])) {
                $tipo = 'empleado';
            } elseif (!empty($usuario['id_cliente'])) {
                $tipo = 'cliente';
            }

            $usuarioSesion = [
                'id' => $usuario['id_persona'],
                'nombres' => $usuario['nombres'],
                'apellidos' => $usuario['apellidos'],
                'correo' => $usuario['correo'],
                'telefono' => $usuario['telefono'],
                'fecha_nacimiento' => $usuario['fecha_nacimiento'],
                'tipo' => $tipo,
                'id_empleado' => $usuario['id_empleado'] ?? null,
                'puesto' => $usuario['puesto_nombre'] ?? null,
                'id_cliente' => $usuario['id_cliente'] ?? null,
                'direccion' => [
                    'region' => $usuario['region'] ?? '',
                    'provincia' => $usuario['provincia'] ?? '',
                    'distrito' => $usuario['distrito'] ?? '',
                    'direccion_detallada' => $usuario['direccion_detallada'] ?? ''
                ]
            ];

            $_SESSION['usuario'] = $usuarioSesion;
        }
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
