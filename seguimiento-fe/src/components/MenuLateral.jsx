// src/components/MenuLateral.jsx
import React, { useState } from "react";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, Typography
} from "@mui/material";
import { 
  FaTasks, FaUsers, FaProjectDiagram, FaUserShield, FaChartBar,
  FaBook, FaClipboardList, FaFileAlt
} from "react-icons/fa";

function MenuLateral({ setVista, usuario }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      sx={{
        width: open ? 240 : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 60,
          boxSizing: "border-box",
          backgroundColor: "#4997D0",
          color: "white",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
        "& .MuiListItem-root": { cursor: "pointer" },
      }}
    >
      <List>
        {/* Menú Principal */}
        {open && <Typography sx={{ pl: 2, pt: 1, fontWeight: "bold" }}>Navegación</Typography>}
        <ListItem button onClick={() => setVista("menuPrincipal")}>
          <ListItemIcon><FaTasks color="white" /></ListItemIcon>
          {open && <ListItemText primary="Menú Principal" />}
        </ListItem>
        <Divider sx={{ bgcolor: "white" }} />

        {/* Ingreso Maestros */}
        {open && <Typography sx={{ pl: 2, pt: 1, fontWeight: "bold" }}>Ingreso Maestros</Typography>}
        <ListItem button onClick={() => setVista("procesos")}>
          <ListItemIcon><FaProjectDiagram color="white" /></ListItemIcon>
          {open && <ListItemText primary="Procesos" />}
        </ListItem>
        <ListItem button onClick={() => setVista("coordinaciones")}>
          <ListItemIcon><FaTasks color="white" /></ListItemIcon>
          {open && <ListItemText primary="Coordinaciones" />}
        </ListItem>

        {/* 👇 Solo Administrador ve Usuarios y Roles */}
        {usuario?.rol === "Administrador" && (
          <>
            <ListItem button onClick={() => setVista("usuarios")}>
              <ListItemIcon><FaUsers color="white" /></ListItemIcon>
              {open && <ListItemText primary="Usuarios" />}
            </ListItem>
            <ListItem button onClick={() => setVista("roles")}>
              <ListItemIcon><FaUserShield color="white" /></ListItemIcon>
              {open && <ListItemText primary="Roles" />}
            </ListItem>
          </>
        )}

        <ListItem button onClick={() => setVista("programas")}>
          <ListItemIcon><FaBook color="white" /></ListItemIcon>
          {open && <ListItemText primary="Programas" />}
        </ListItem>
        <ListItem button onClick={() => setVista("subprogramas")}>
          <ListItemIcon><FaClipboardList color="white" /></ListItemIcon>
          {open && <ListItemText primary="Subprogramas" />}
        </ListItem>
        <Divider sx={{ bgcolor: "white" }} />

        {/* Seguimiento Documentos */}
        {open && <Typography sx={{ pl: 2, pt: 1, fontWeight: "bold" }}>Seguimiento Documentos</Typography>}
        <ListItem button onClick={() => setVista("envios")}>
          <ListItemIcon><FaFileAlt color="white" /></ListItemIcon>
          {open && <ListItemText primary="Ingreso de Envíos" />}
        </ListItem>
        <ListItem button onClick={() => setVista("seguimiento")}>
          <ListItemIcon><FaFileAlt color="white" /></ListItemIcon>
          {open && <ListItemText primary="Seguimiento de Envíos" />}
        </ListItem> {/* nuevo */}

        <Divider sx={{ bgcolor: "white" }} />

        {/* Dashboard */}
        {open && <Typography sx={{ pl: 2, pt: 1, fontWeight: "bold" }}>Dashboard</Typography>}
        <ListItem button onClick={() => setVista("dashboard")}>
          <ListItemIcon><FaChartBar color="white" /></ListItemIcon>
          {open && <ListItemText primary="Dashboard" />}
        </ListItem>
      </List>
    </Drawer>
  );
}

export default MenuLateral;