import { useState } from "react";
import useConfirm from "./../util/useConfirm"
import ConfirmDialog from "./ConfirmDialog";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { copyRowToClipboard, shareRowOnWhatsApp } from "./../util/utils";
import {
    Modal, Box, Typography, TableContainer, Table, TableBody, TableRow, TableCell,
    Button, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert
} from "@mui/material";
import { Delete, Search } from "@mui/icons-material";
const ContactosModal = ({ modalOpen, setModalOpen, title, contactos, agregarContacto, deleteContacto }) => {

    const { confirmData, showConfirm, closeConfirm } = useConfirm();
    const [nuevoContacto, setNuevoContacto] = useState({
        name: "",
        type: "",
        phone: "",
        location: "",
    });
    const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
    const { data: session } = useSession();
    const [role, setRole] = useState(0);
          useEffect(() => {
              if (session) {
                  setRole(session.user?.role?.level || 0);
              }
          }, [session]);
      
          const hasAccess = useMemo(() => role >= 3, [role]);
          const addAccess = useMemo(() => role >= 2, [role]);

    // Estado para búsqueda de contactos
    const [searchTerm, setSearchTerm] = useState("");

    const handleCloseSnackbar = () => setSnackbar(null);


    const handleChange = (e) => {
        setNuevoContacto({ ...nuevoContacto, [e.target.name]: e.target.value });
    };

    const handleAgregarContacto = () => {
        if (!nuevoContacto.name || !nuevoContacto.phone) {
            setSnackbar({children: "El nombre y el teléfono son obligatorios", severity: "error" });
            return;
        }

        agregarContacto(nuevoContacto); // Llama a la función que enviará el nuevo contacto a la API
        setNuevoContacto({ name: "", type: "", phone: "", location: "" }); // Limpia el formulario
    };

    const handleDeleteContacto = (contactoId) => {
        deleteContacto(contactoId)
        setSnackbar({children: "Contacto Borrado", severity: "success" });
        closeConfirm();
    }

    // Filtrar contactos en base a la búsqueda
    const filteredContactos = contactos.filter((contacto) =>
        contacto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contacto.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <><Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box sx={{ p: 3, backgroundColor: "white", width: 700, margin: "auto", mt: 10, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nombre o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1 }} />,
                    }}
                    sx={{ mb: 2 }}
                />
                {/* TABLA DE CONTACTOS */}
                <TableContainer sx={{ maxHeight: 300, overflowY: "auto" }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell>Localización</TableCell>
                                <TableCell sx={{ width: 10 }}></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {filteredContactos.length > 0 ? (
                                filteredContactos.map((contacto) => (
                                    <TableRow key={contacto.id}>
                                        <TableCell>{contacto.name}</TableCell>
                                        <TableCell>{contacto.type}</TableCell>
                                        <TableCell>{contacto.phone}</TableCell>
                                        <TableCell>{contacto.location}</TableCell>
                                        <TableCell>
                                            <IconButton disabled={!addAccess}size="small" color="primary"
                                                onClick={() => {copyRowToClipboard(contacto), setSnackbar({children: `Contacto ${contacto.name} Copiado`, severity: "success" })} }
                                            >
                                                <ContentCopyIcon/></IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton disabled={!addAccess} size="small" color="success"
                                                onClick={() => {shareRowOnWhatsApp(contacto)} }
                                            >
                                                <WhatsAppIcon/>
                                                </IconButton>
                                        </TableCell>
                                        <TableCell align="right"><IconButton disabled={!hasAccess} size="small" color="error" onClick={() => {showConfirm("Eliminar Contacto", "¿Seguro que quieres eliminar?", () => handleDeleteContacto(contacto.id))}}><Delete /></IconButton></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography>No hay Contactos disponibles.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* FORMULARIO PARA AÑADIR CONTACTO */}
                {hasAccess && 
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Añadir Contacto</Typography>
                    <TextField fullWidth name="name" label="Nombre" value={nuevoContacto.name} onChange={handleChange} sx={{ mb: 1 }} />
                    <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            name="type"
                            value={nuevoContacto.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="Vecino">Vecino</MenuItem>
                            <MenuItem value="Mantenedor">Mantenedor</MenuItem>
                            <MenuItem value="Presidente">Presidente</MenuItem>
                            <MenuItem value="Vocal">Vocal</MenuItem>
                            <MenuItem value="Vicepresidente">Vicepresidente</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField fullWidth name="phone" label="Teléfono" value={nuevoContacto.phone} onChange={handleChange} sx={{ mb: 1 }} />
                    <TextField fullWidth name="location" label="Localización" value={nuevoContacto.location} onChange={handleChange} sx={{ mb: 1 }} />


                </Box>}

                {/* BOTÓN CERRAR */}
                <Button variant="outlined" disabled={!hasAccess} color="success" sx={{ mt: 2 }} onClick={handleAgregarContacto}>Guardar</Button>
                <Button variant="outlined" sx={{ mt: 2, ml: 1 }} onClick={() => setModalOpen(false)}>Cerrar</Button>
            </Box>

        </Modal>

            <ConfirmDialog
                open={confirmData.open}
                onClose={closeConfirm}
                onConfirm={confirmData.onConfirm}
                title={confirmData.title}
                message={confirmData.message}
            />
            {/* Notificaciones */}
            {!!snackbar && (
                <Snackbar open anchorOrigin={{ vertical: "bottom", horizontal: "center" }} onClose={handleCloseSnackbar} autoHideDuration={6000}>
                    <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
                        {snackbar.children}
                    </Alert>
                </Snackbar>
            )}

        </>

    );
};

export default ContactosModal;
