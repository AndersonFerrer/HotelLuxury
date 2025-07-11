<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class TiposCaracteristicasService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Obtiene todos los tipos de habitación con sus características
     */
    public function obtenerTiposHabitacion() {
        try {
            $sql = "SELECT 
                        th.id_tipo_habitacion,
                        th.nombre,
                        th.descripcion,
                        th.precio_noche,
                        th.aforo,
                        COUNT(DISTINCT h.id_habitacion) as habitaciones_count,
                        COUNT(DISTINCT thc.id_caracteristica) as caracteristicas_count
                    FROM TipoHabitacion th
                    LEFT JOIN Habitacion h ON th.id_tipo_habitacion = h.id_tipo_habitacion
                    LEFT JOIN TipoHabitacionCaracteristica thc ON th.id_tipo_habitacion = thc.id_tipo_habitacion
                    GROUP BY th.id_tipo_habitacion, th.nombre, th.descripcion, th.precio_noche, th.aforo
                    ORDER BY th.nombre";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $tipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Obtener características para cada tipo
            foreach ($tipos as &$tipo) {
                $tipo['caracteristicas_asignadas'] = $this->obtenerCaracteristicasTipo($tipo['id_tipo_habitacion']);
            }

            return [
                'success' => true,
                'tipos' => $tipos,
                'message' => 'Tipos de habitación obtenidos correctamente'
            ];
        } catch (PDOException $e) {
            error_log("Error al obtener tipos de habitación: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener tipos de habitación'
            ];
        }
    }

    /**
     * Obtiene todas las características con contador de habitaciones
     */
    public function obtenerCaracteristicas() {
        try {
            $sql = "SELECT 
                        c.id_caracteristica,
                        c.nombre,
                        c.descripcion,
                        COUNT(DISTINCT h.id_habitacion) as habitaciones_count
                    FROM Caracteristica c
                    LEFT JOIN TipoHabitacionCaracteristica thc ON c.id_caracteristica = thc.id_caracteristica
                    LEFT JOIN Habitacion h ON thc.id_tipo_habitacion = h.id_tipo_habitacion
                    GROUP BY c.id_caracteristica, c.nombre, c.descripcion
                    ORDER BY c.nombre";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $caracteristicas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'caracteristicas' => $caracteristicas,
                'message' => 'Características obtenidas correctamente'
            ];
        } catch (PDOException $e) {
            error_log("Error al obtener características: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener características'
            ];
        }
    }

    /**
     * Crea un nuevo tipo de habitación
     */
    public function crearTipoHabitacion($datos) {
        try {
            // Validar datos requeridos
            if (empty($datos['nombre']) || !isset($datos['precio']) || $datos['precio'] <= 0) {
                throw new Exception("Nombre y precio son requeridos y el precio debe ser mayor a 0");
            }

            // Verificar que el nombre no exista
            $stmt = $this->conn->prepare("SELECT id_tipo_habitacion FROM TipoHabitacion WHERE nombre = ?");
            $stmt->execute([$datos['nombre']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("Ya existe un tipo de habitación con ese nombre");
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            try {
                // Insertar tipo de habitación
                $sql = "INSERT INTO TipoHabitacion (nombre, descripcion, precio_noche, aforo) 
                        VALUES (?, ?, ?, ?) 
                        RETURNING id_tipo_habitacion";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    $datos['nombre'],
                    $datos['descripcion'] ?? '',
                    $datos['precio'],
                    $datos['aforo'] ?? 4
                ]);
                
                $id_tipo_habitacion = $stmt->fetch(PDO::FETCH_ASSOC)['id_tipo_habitacion'];

                // Asignar características si se proporcionan
                if (!empty($datos['caracteristicas']) && is_array($datos['caracteristicas'])) {
                    $this->asignarCaracteristicasTipo($id_tipo_habitacion, $datos['caracteristicas']);
                }

                $this->conn->commit();

                return [
                    'success' => true,
                    'message' => 'Tipo de habitación creado exitosamente',
                    'id_tipo_habitacion' => $id_tipo_habitacion
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
     * Actualiza un tipo de habitación existente
     */
    public function actualizarTipoHabitacion($id_tipo_habitacion, $datos) {
        try {
            // Validar que el tipo existe
            $stmt = $this->conn->prepare("SELECT id_tipo_habitacion FROM TipoHabitacion WHERE id_tipo_habitacion = ?");
            $stmt->execute([$id_tipo_habitacion]);
            if ($stmt->rowCount() === 0) {
                throw new Exception("Tipo de habitación no encontrado");
            }

            // Validar datos requeridos
            if (empty($datos['nombre']) || !isset($datos['precio']) || $datos['precio'] <= 0) {
                throw new Exception("Nombre y precio son requeridos y el precio debe ser mayor a 0");
            }

            // Verificar que el nombre no exista en otro tipo
            $stmt = $this->conn->prepare("SELECT id_tipo_habitacion FROM TipoHabitacion WHERE nombre = ? AND id_tipo_habitacion != ?");
            $stmt->execute([$datos['nombre'], $id_tipo_habitacion]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("Ya existe otro tipo de habitación con ese nombre");
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            try {
                // Actualizar tipo de habitación
                $sql = "UPDATE TipoHabitacion 
                        SET nombre = ?, descripcion = ?, precio_noche = ?, aforo = ? 
                        WHERE id_tipo_habitacion = ?";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    $datos['nombre'],
                    $datos['descripcion'] ?? '',
                    $datos['precio'],
                    $datos['aforo'] ?? 4,
                    $id_tipo_habitacion
                ]);

                // Actualizar características
                $this->actualizarCaracteristicasTipo($id_tipo_habitacion, $datos['caracteristicas'] ?? []);

                $this->conn->commit();

                return [
                    'success' => true,
                    'message' => 'Tipo de habitación actualizado exitosamente'
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
     * Elimina un tipo de habitación
     */
    public function eliminarTipoHabitacion($id_tipo_habitacion) {
        try {
            // Verificar que el tipo existe
            $stmt = $this->conn->prepare("SELECT nombre FROM TipoHabitacion WHERE id_tipo_habitacion = ?");
            $stmt->execute([$id_tipo_habitacion]);
            if ($stmt->rowCount() === 0) {
                throw new Exception("Tipo de habitación no encontrado");
            }

            // Verificar que no haya habitaciones asociadas
            $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM Habitacion WHERE id_tipo_habitacion = ?");
            $stmt->execute([$id_tipo_habitacion]);
            $habitaciones = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($habitaciones > 0) {
                throw new Exception("No se puede eliminar el tipo de habitación porque tiene habitaciones asociadas");
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            try {
                // Eliminar características asignadas
                $stmt = $this->conn->prepare("DELETE FROM TipoHabitacionCaracteristica WHERE id_tipo_habitacion = ?");
                $stmt->execute([$id_tipo_habitacion]);

                // Eliminar tipo de habitación
                $stmt = $this->conn->prepare("DELETE FROM TipoHabitacion WHERE id_tipo_habitacion = ?");
                $stmt->execute([$id_tipo_habitacion]);

                $this->conn->commit();

                return [
                    'success' => true,
                    'message' => 'Tipo de habitación eliminado exitosamente'
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
     * Crea una nueva característica
     */
    public function crearCaracteristica($datos) {
        try {
            // Validar datos requeridos
            if (empty($datos['nombre'])) {
                throw new Exception("El nombre de la característica es requerido");
            }

            // Verificar que el nombre no exista
            $stmt = $this->conn->prepare("SELECT id_caracteristica FROM Caracteristica WHERE nombre = ?");
            $stmt->execute([$datos['nombre']]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("Ya existe una característica con ese nombre");
            }

            // Insertar característica
            $sql = "INSERT INTO Caracteristica (nombre, descripcion) VALUES (?, ?) RETURNING id_caracteristica";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $datos['nombre'],
                $datos['descripcion'] ?? ''
            ]);

            $id_caracteristica = $stmt->fetch(PDO::FETCH_ASSOC)['id_caracteristica'];

            return [
                'success' => true,
                'message' => 'Característica creada exitosamente',
                'id_caracteristica' => $id_caracteristica
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Actualiza una característica existente
     */
    public function actualizarCaracteristica($id_caracteristica, $datos) {
        try {
            // Verificar que la característica existe
            $stmt = $this->conn->prepare("SELECT id_caracteristica FROM Caracteristica WHERE id_caracteristica = ?");
            $stmt->execute([$id_caracteristica]);
            if ($stmt->rowCount() === 0) {
                throw new Exception("Característica no encontrada");
            }

            // Validar datos requeridos
            if (empty($datos['nombre'])) {
                throw new Exception("El nombre de la característica es requerido");
            }

            // Verificar que el nombre no exista en otra característica
            $stmt = $this->conn->prepare("SELECT id_caracteristica FROM Caracteristica WHERE nombre = ? AND id_caracteristica != ?");
            $stmt->execute([$datos['nombre'], $id_caracteristica]);
            if ($stmt->rowCount() > 0) {
                throw new Exception("Ya existe otra característica con ese nombre");
            }

            // Actualizar característica
            $sql = "UPDATE Caracteristica SET nombre = ?, descripcion = ? WHERE id_caracteristica = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $datos['nombre'],
                $datos['descripcion'] ?? '',
                $id_caracteristica
            ]);

            return [
                'success' => true,
                'message' => 'Característica actualizada exitosamente'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Elimina una característica
     */
    public function eliminarCaracteristica($id_caracteristica) {
        try {
            // Verificar que la característica existe
            $stmt = $this->conn->prepare("SELECT nombre FROM Caracteristica WHERE id_caracteristica = ?");
            $stmt->execute([$id_caracteristica]);
            if ($stmt->rowCount() === 0) {
                throw new Exception("Característica no encontrada");
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            try {
                // Eliminar asignaciones de características
                $stmt = $this->conn->prepare("DELETE FROM TipoHabitacionCaracteristica WHERE id_caracteristica = ?");
                $stmt->execute([$id_caracteristica]);

                // Eliminar característica
                $stmt = $this->conn->prepare("DELETE FROM Caracteristica WHERE id_caracteristica = ?");
                $stmt->execute([$id_caracteristica]);

                $this->conn->commit();

                return [
                    'success' => true,
                    'message' => 'Característica eliminada exitosamente'
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
     * Obtiene estadísticas generales
     */
    public function obtenerEstadisticas() {
        try {
            // Total tipos de habitación
            $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM TipoHabitacion");
            $stmt->execute();
            $total_tipos = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Total características
            $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM Caracteristica");
            $stmt->execute();
            $total_caracteristicas = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Precio promedio
            $stmt = $this->conn->prepare("SELECT AVG(precio_noche) as promedio FROM TipoHabitacion");
            $stmt->execute();
            $precio_promedio = $stmt->fetch(PDO::FETCH_ASSOC)['promedio'];

            // Total habitaciones
            $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM Habitacion");
            $stmt->execute();
            $total_habitaciones = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            return [
                'success' => true,
                'stats' => [
                    'total_tipos' => (int)$total_tipos,
                    'total_caracteristicas' => (int)$total_caracteristicas,
                    'precio_promedio' => round($precio_promedio, 2),
                    'total_habitaciones' => (int)$total_habitaciones
                ]
            ];

        } catch (PDOException $e) {
            error_log("Error al obtener estadísticas: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener estadísticas'
            ];
        }
    }

    // Métodos auxiliares privados

    /**
     * Obtiene las características asignadas a un tipo de habitación
     */
    private function obtenerCaracteristicasTipo($id_tipo_habitacion) {
        $sql = "SELECT c.id_caracteristica 
                FROM Caracteristica c
                JOIN TipoHabitacionCaracteristica thc ON c.id_caracteristica = thc.id_caracteristica
                WHERE thc.id_tipo_habitacion = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id_tipo_habitacion]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Asigna características a un tipo de habitación
     */
    private function asignarCaracteristicasTipo($id_tipo_habitacion, $caracteristicas) {
        if (empty($caracteristicas)) return;

        $sql = "INSERT INTO TipoHabitacionCaracteristica (id_tipo_habitacion, id_caracteristica) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        foreach ($caracteristicas as $id_caracteristica) {
            $stmt->execute([$id_tipo_habitacion, $id_caracteristica]);
        }
    }

    /**
     * Actualiza las características de un tipo de habitación
     */
    private function actualizarCaracteristicasTipo($id_tipo_habitacion, $caracteristicas) {
        // Eliminar asignaciones actuales
        $stmt = $this->conn->prepare("DELETE FROM TipoHabitacionCaracteristica WHERE id_tipo_habitacion = ?");
        $stmt->execute([$id_tipo_habitacion]);

        // Asignar nuevas características
        if (!empty($caracteristicas)) {
            $this->asignarCaracteristicasTipo($id_tipo_habitacion, $caracteristicas);
        }
    }
}
?> 