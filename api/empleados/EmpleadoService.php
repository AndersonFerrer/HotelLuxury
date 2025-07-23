<?php
require_once __DIR__ . '/../config.php';

class EmpleadoService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getAllEmpleados() {
        $sql = "SELECT 
            e.id_empleado as id,
            p.nombres,
            p.apellidos,
            p.created_at as fecha_ingreso,
            td.nombre as tipo_documento,
            p.numero_documento,
            p.correo,
            p.telefono,
            d.region,
            d.provincia,
            d.distrito,
            d.direccion_detallada as direccion,
            pu.nombre as cargo,
            e.id_puesto as cargo_id
        FROM Empleado e
        INNER JOIN Persona p ON e.id_persona = p.id_persona
        INNER JOIN Puesto pu ON e.id_puesto = pu.id_puesto
        INNER JOIN TipoDocumento td ON p.id_tipo_documento = td.id_tipo_documento
        LEFT JOIN Direccion d ON p.id_direccion = d.id_direccion
        ORDER BY e.id_empleado DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $result;
    }
    /**
     * Registra un nuevo empleado en el sistema
     */
    public function registrarEmpleado($datos) {
        $this->conn->beginTransaction();
        try {
            // Validar datos requeridos
            $required = [
                'nombres','apellidos','id_tipo_documento','numero_documento','telefono','correo','password',
                'region','provincia','distrito','direccion_detallada','id_puesto','fecha_nacimiento'
            ];
            foreach ($required as $field) {
                if (empty($datos[$field])) {
                    throw new Exception("El campo $field es requerido");
                }
            }
            
            // Validar que el empleado sea mayor de 18 años
            $fechaNacimiento = new DateTime($datos['fecha_nacimiento']);
            $hoy = new DateTime();
            $edad = $hoy->diff($fechaNacimiento)->y;
            
            if ($edad < 18) {
                throw new Exception("El empleado debe ser mayor de 18 años");
            }
            
            // Verificar unicidad de correo y documento
            $stmt = $this->conn->prepare("SELECT id_persona FROM Persona WHERE correo = ?");
            $stmt->execute([$datos['correo']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("El correo electrónico ya está registrado");
            }
            $stmt = $this->conn->prepare("SELECT id_persona FROM Persona WHERE numero_documento = ? AND id_tipo_documento = ?");
            $stmt->execute([$datos['numero_documento'], $datos['id_tipo_documento']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("El número de documento ya está registrado para este tipo de documento");
            }
            // Insertar dirección
            $stmt = $this->conn->prepare("INSERT INTO Direccion (region, provincia, distrito, direccion_detallada) VALUES (?, ?, ?, ?) RETURNING id_direccion");
            $stmt->execute([
                $datos['region'], $datos['provincia'], $datos['distrito'], $datos['direccion_detallada']
            ]);
            $id_direccion = $stmt->fetch(PDO::FETCH_ASSOC)['id_direccion'];
            // Insertar persona
            $hashedPassword = password_hash($datos['password'], PASSWORD_BCRYPT);
            $stmt = $this->conn->prepare("INSERT INTO Persona (nombres, apellidos, id_tipo_documento, numero_documento, telefono, correo, password, id_direccion, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id_persona");
            $stmt->execute([
                $datos['nombres'], $datos['apellidos'], $datos['id_tipo_documento'], $datos['numero_documento'],
                $datos['telefono'], $datos['correo'], $hashedPassword, $id_direccion
            ]);
            $id_persona = $stmt->fetch(PDO::FETCH_ASSOC)['id_persona'];
            // Insertar empleado
            $stmt = $this->conn->prepare("INSERT INTO Empleado (id_persona, id_puesto) VALUES (?, ?) RETURNING id_empleado");
            $stmt->execute([$id_persona, $datos['id_puesto']]);
            $id_empleado = $stmt->fetch(PDO::FETCH_ASSOC)['id_empleado'];
            $this->conn->commit();
            return [
                'success' => true,
                'message' => 'Empleado registrado exitosamente.',
                'id_empleado' => $id_empleado
            ];
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
?>
