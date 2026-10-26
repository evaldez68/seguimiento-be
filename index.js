console.log("INICIANDO SERVIDOR...");
import express from 'express';
import cors from "cors";
import coordinacionesRoutes from './routes/coordinaciones.js';
import procesosRoutes from './routes/procesos.js';
import maestroEnviosRoutes from './routes/maestro_envios.js';
import detalleEnviosRoutes from './routes/detalle_envios.js';
import rolesSeguimientoRoutes from './routes/roles_seguimiento.js';
import seguimientoDocumentosRoutes from './routes/seguimiento_documentos.js';
import usuariosSeguimientoRoutes from './routes/usuarios_seguimiento.js';
import programasRoutes from "./routes/programas.js";
import subprogramasRoutes from "./routes/subprogramas.js";
import expedientesRouter from "./routes/expedientes.js";
import departamentosRouter from './routes/departamentos.js';
import municipiosRouter from './routes/municipios.js'
import expedientesEstatusRouter from "./routes/expedientes_estatus.js";
import expedientesBatchRoutes from "./routes/expedientes_batch.js";
import expedientesSeguimientoRoutes from './routes/expedientes_seguimiento.js';
import expedientesTrasladoRoutes from './routes/expedientes_traslado.js';
import notasTrasladoRoutes from './routes/notas_trasla.js';
import seguimientoConsultaRouter from './routes/seguimiento_consulta.js';
import seguimientoHistorialRouter from './routes/seguimiento_historial.js';
import couriersRouter from './routes/couriers.js';

const app = express();

// 👇 Ajuste para payloads grandes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

// Ruta raíz para confirmar que la API está online
app.get("/", (req, res) => {
  res.json({ mensaje: "API Seguimiento Online 📑🚀" });
});

// Rutas
app.use('/coordinaciones', coordinacionesRoutes);
app.use('/maestro_envios', maestroEnviosRoutes);
app.use('/detalle_envios', detalleEnviosRoutes);
app.use('/procesos', procesosRoutes);
app.use('/roles_seguimiento', rolesSeguimientoRoutes);
app.use('/seguimiento_documentos', seguimientoDocumentosRoutes);
app.use('/usuarios_seguimiento', usuariosSeguimientoRoutes);
app.use("/programas", programasRoutes);
app.use("/subprogramas", subprogramasRoutes);
app.use("/expedientes", expedientesRouter);
app.use("/expedientes_estatus", expedientesEstatusRouter);
app.use("/expedientes_batch", expedientesBatchRoutes);
app.use('/departamentos', departamentosRouter);
app.use('/municipios', municipiosRouter);
app.use('/expedientes_seguimiento', expedientesSeguimientoRoutes);
app.use('/expedientes_traslado', expedientesTrasladoRoutes);
app.use('/notas_trasla', notasTrasladoRoutes);
app.use('/seguimiento_consulta', seguimientoConsultaRouter);
app.use('/seguimiento_historial', seguimientoHistorialRouter);
app.use('/couriers', couriersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Seguimiento corriendo en puerto ${PORT}`);
});