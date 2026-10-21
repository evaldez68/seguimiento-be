-- Insertar procesos
INSERT INTO procesos (nombre_proceso, encargado, secuencia, seq_ant, seq_sig) VALUES
('Traslado Documento', 'Coordinadora Departamental / Despacho / DAS', 10, NULL, 20),
('Recepcion Documento DCO', 'Recepción DCO', 20, 10, 30),
('Recepcion Encargado/Analista Programa', 'Encargado Programa DCO', 30, 20, 40),
('Envio Resolución a Sede Requerida', 'Encargado Programa DCO', 40, 30, 50),
('Recepción Resolución Sede', 'Coordinadora Departamental / Despacho / DAS', 50, 40, 60),
('Envió entidad solicitante', 'Coordinadora Departamental / Despacho / DAS', 60, 50, NULL);


select * from procesos p 

delete from maestro_envios 

delete from detalle_envios 

select * from seguimiento_documentos 

