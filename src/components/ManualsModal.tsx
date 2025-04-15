import { Manual } from "@edifitech-graphql/index";
import { FileOpen } from "@mui/icons-material";
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Modal,
    Typography
} from "@mui/material";
import React from "react";

const ManualsModal = ({ modalOpen, setModalOpen, product, manuals }) => {


    return (
        <>
            <Modal open={Boolean(modalOpen)} onClose={() => setModalOpen(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 500, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Manuales para {product?.name}</Typography>

                    {/* Verifica si hay manuales disponibles */}
                    {manuals.length > 0 ? (
                        <List dense={true}>
                            {manuals.map((manual: Manual, index) => (
                                <ListItem key={index} >
                                    <ListItemButton component="a" href={manual.documento?.url || '#'} target="_blank">
                                        <ListItemIcon>
                                            <FileOpen />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={manual.name}
                                            secondary={
                                                manual.documento?.url || "URL no disponible" // Maneja casos donde url no existe
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ mt: 2 }}>No hay manuales disponibles.</Typography>
                    )}

                    {/* Botón para cerrar el modal */}
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => setModalOpen(false)}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Modal>
        </>

    );
};

export default ManualsModal;
