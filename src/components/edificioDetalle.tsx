

import { Select, FormControl, Divider, InputLabel, MenuItem, Pagination, Checkbox, TextField, Badge, Card, Box, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, IconButton, Button, CardActions, Modal } from "@mui/material";
import { Add, Remove, Phone, Delete, CircleNotifications, Reply, Description } from "@mui/icons-material";
import BusinessIcon from "@mui/icons-material/Business";
import { useState } from "react";
import Image from "next/image";
import Grid from '@mui/material/Grid2';
import { GET_CATEGORIES, GET_PRODUCTS, CREATE_CONTACTO, DELETE_CONTACTO, CREATE_EDIFICIO, CREATE_INSTALACION, DELETE_INSTALACION, POST_COMMENT, DELETE_EDIFICIO, ADD_ELEMENTOS, DELETE_ELEMENTO, UPDATE_ELEMENTO } from "@/graphql/queries";
import { useQuery, useMutation } from "@apollo/client";
import { AntenaIcon, CCTVIcon, ElectricityIcon, IntercomIcon, FireEstinguisherIcon, RfidIcon, KeyIcon, AutomaticDoorIcon } from "@/components/CustomIcons";
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import ConfirmDialog from "./ConfirmDialog";
import ContactosModal from "./ContactosModal";
import useConfirm from "./../util/useConfirm"
import { useMemo, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import { useRouter } from "next/navigation"; // Correcto para App Router
moment().locale('es');

import CommentsList from "./CommentList";



const getInstalacionIcon = (tipo) => {
    const iconStyle = { fontSize: 40, fill: "#4db6ac" };
    switch (tipo) {
        case "Antena": return <AntenaIcon sx={iconStyle} />;
        case "Portero": return <IntercomIcon sx={iconStyle} />;
        case "Cerrajeria": return <KeyIcon sx={iconStyle} />;
        case "Cerrajería": return <KeyIcon sx={iconStyle} />;
        case "Automatismo": return <AutomaticDoorIcon sx={iconStyle} />;
        case "CCTV": return <CCTVIcon sx={iconStyle} />;
        case "Electricidad": return <ElectricityIcon sx={iconStyle} />;
        case "Contraincendio": return <FireEstinguisherIcon sx={iconStyle} />;
        default: return <CircleNotifications sx={iconStyle} />;
    }
};

export default function DetalleEdificio({ edificio }) {

    const router = useRouter();

    const { confirmData, showConfirm, closeConfirm } = useConfirm();

    const { data: session } = useSession();
    const [createEdificio] = useMutation(CREATE_EDIFICIO, {
        refetchQueries: ["GetEdificio"], // Para actualizar la UI después de reaccionar
    });
    const [postComment] = useMutation(POST_COMMENT, {
        refetchQueries: ["GetEdificio"],
    })
    const [deleteEdificio] = useMutation(DELETE_EDIFICIO, {
        refetchQueries: ["GetEdificio"],
    })
    const [deleteElemento] = useMutation(DELETE_ELEMENTO, {
        refetchQueries: ["GetEdificio"],
    })
    const [updateElemento] = useMutation(UPDATE_ELEMENTO, {
        refetchQueries: ["GetEdificio"],
    })
    const [createInstalacion, { error }] = useMutation(CREATE_INSTALACION, {
        refetchQueries: ["GetEdificio"], // Actualiza la UI después de crear una instalación
    });

    const [deleteInstalacion] = useMutation(DELETE_INSTALACION, {
        refetchQueries: ["GetEdificio"],
    })

    const [addElementosMutation] = useMutation(ADD_ELEMENTOS, {
        refetchQueries: ["GetEdificio"], // Para actualizar la UI después de agregar elementos
    });

    const [createContacto] = useMutation(CREATE_CONTACTO, {
        refetchQueries: ["GetEdificio"], // Actualiza la UI después de crear una instalación
    });

    const [deleteContacto] = useMutation(DELETE_CONTACTO, {
        refetchQueries: ["GetEdificio"],
    })

    const { data: dataCategories } = useQuery(GET_CATEGORIES);

    const tiposInstalacion = dataCategories?.listCategories || [];


    const [tabIndex, setTabIndex] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [manuals, setManuals] = useState([]);
    const [modalManuals, setModalManuals] = useState(false);
    const [modalComment, setModalComment] = useState(false);
    const [modalContactos, setModalContactos] = useState(false);
    const [modalEdificio, setModalEdificio] = useState(false);
    const [modalElement, setModalElement] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newEdificio, setNewEdificio] = useState("");
    const [newInstalacion, setNewInstalacion] = useState({ tipo: "", descripcion: "", categoryId: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedInstalacion, setSelectedInstalacion] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [page, setPage] = useState(1);
    const pageSize = 10;


    const [role, setRole] = useState(0);
    useEffect(() => {
        if (session) {
            setRole(session.user?.role?.level || 0);
        }
    }, [session]);

    const hasAccess = useMemo(() => role >= 3, [role]);
    const addAccess = useMemo(() => role >= 2, [role]);

    const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
            <Tooltip {...props} classes={{ popper: className }} />
          ))({
            [`& .${tooltipClasses.tooltip}`]: {
              maxWidth: 500,
              backgroundColor: "transparent",
            },
          });
    
        const ImageWithTooltip = ({ src }) => (
            <StyledTooltip
              title={
                <Image
                  src={src}
                  alt="Producto"
                  width={500} // Ajusta el tamaño grande
                  height={500}
                  style={{
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                  }}
                />
              }
              placement="right"
            >
              <Image
                src={src}
                alt="Producto"
                width={40} // Miniatura en la tabla
                height={40}
                style={{ cursor: "pointer", objectFit: "contain" }}
              />
            </StyledTooltip>
          );


    function useProductos(searchTerm, page, pageSize, categoryId) {
        const { data, loading, error } = useQuery(GET_PRODUCTS, {
            variables: { searchTerm, page, pageSize, categoryId },
            skip: !categoryId, // No ejecutar la consulta si no hay categoría seleccionada
        });
        console.log("Categoria", selectedInstalacion?.categoryId)

        return {
            productos: data?.listProductos.productos || [],
            totalCount: data?.listProductos.totalCount || 0,
            loading,
            error,
        };
    }
    const { productos, totalCount, loading } = useProductos(searchTerm, page, pageSize, selectedInstalacion?.categoryId);

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    if (!productos) {
        console.log("No hay productos")
    }

    const handleSelectProduct = (producto) => {
        setSelectedProducts((prev) => {
            const exists = prev.find(p => p.id === producto.id);
            if (exists) {
                return prev.filter(p => p.id !== producto.id);
            }
            return [...prev, { ...producto, quantity: 1, instalacionId: selectedInstalacion.id }];
        });
    };


    const handleAddComment = async () => {
        try {
            console.log("Nuevo comentario:", newComment);

            await postComment({
                variables: { authorId: session?.user?.id, edificioId: edificio.id, comment: newComment }
            });
            setModalComment(false);
            setNewComment("")
        } catch (error) {
            console.error("Error al reaccionar:", error);
        }
    };
    const handleAddEdificio = async () => {
        console.log("Nuevo edificio:", newEdificio);
        const variables: any = {
            input: {
                name: newEdificio,
                direccion: edificio.direccion,
                cp: edificio.cp,
                edificioId: edificio.id
            },
        };
        const response = await createEdificio({ variables });
        setModalEdificio(false);
    };

    const handleShowManuals = (manuales) => {
        setManuals(manuales);
        setModalManuals(true);
    };


    const handleQuantityChange = (id, delta) => {
        setSelectedProducts((prev) => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
    };

    const handleAddElements = async () => {
        if (!selectedInstalacion.id || selectedProducts.length === 0) {
            console.error("Debe seleccionar una instalación y al menos un producto.");
            return;
        }

        try {
            console.log("Añadiendo elementos a la instalación:", selectedInstalacion.id, selectedProducts);

            await addElementosMutation({
                variables: {
                    instalacionId: selectedInstalacion.id,
                    elementos: selectedProducts.map(p => ({
                        productoId: p.id,
                        cantidad: p.quantity
                        ,
                    })),
                },
            });

            // Si la mutación es exitosa, cerramos el modal y limpiamos la selección
            setModalElement(false);
            setSelectedProducts([]);
        } catch (error) {
            console.error("Error al añadir elementos:", error);
        }
    };

    const handleDeleteInstalacion = async (instalacionId) => {
        try {
            await deleteInstalacion({
                variables: { id: instalacionId }
            });
            closeConfirm();
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    };

    const handleUpdateCantidad = async (elementoId, nuevaCantidad) => {
        if (!elementoId || nuevaCantidad < 1) {
            console.error("Cantidad inválida o ID de elemento no válido.");
            return;
        }

        try {
            console.log(`Actualizando cantidad del elemento ${elementoId} a ${nuevaCantidad}`);

            await updateElemento({
                variables: {
                    updateElementoId: elementoId,
                    input: {
                        cantidad: nuevaCantidad,
                    },
                },
            });
        } catch (error) {
            console.error("Error al actualizar cantidad:", error);
        }
    };


    const handleDeleteElemento = async (elementoId) => {
        console.log("Elemento Borrado", elementoId)
        try {
            await deleteElemento({
                variables: { id: elementoId }
            });
            closeConfirm();
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    }

    const handleCreateInstalacion = async () => {
        if (!newInstalacion.tipo || !newInstalacion.descripcion) {
            console.error("Todos los campos son obligatorios.");
            return;
        }

        try {
            console.log("Creando instalación:", newInstalacion);

            await createInstalacion({
                variables: {
                    input: {
                        edificioId: edificio.id,
                        tipo: newInstalacion.tipo,
                        categoryId: newInstalacion.categoryId,
                        descripcion: newInstalacion.descripcion,
                    },
                },
            });

            // Resetear formulario tras éxito
            setNewInstalacion({ tipo: "", descripcion: "", categoryId: "" });
        } catch (error) {
            console.error("Error al crear instalación:", error);
        }
    };

    const handleAgregarContacto = async (contacto) => {
        try {
            await createContacto({ variables: { input: { ...contacto, edificioId: edificio.id } } });
            console.log("nuevo contacto: ", contacto)
        } catch (error) {
            console.error("Error al agregar contacto:", error);
        }
    };

    const handleDeleteContacto = async (contactoId) => {
        try {
            await deleteContacto({
                variables: { id: contactoId }
            });
            closeConfirm();
        } catch (error) {
            console.error("Error al borrar:", error);
        }
    };



    return (
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 8, md: 12 }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Card
                    sx={{
                        height: "100%",
                        boxShadow: 3,
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        p: 3
                    }}
                >
                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                        {/* Contenedor alineado para el nombre del edificio y comunidad */}
                        <Box display="flex" flexDirection="column">
                            <Box display="flex" alignItems="center" gap={1}>
                                <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h4" fontWeight="bold">{edificio.name}</Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                color="primary"
                                sx={{ cursor: "pointer" }}
                                onClick={() => router.push(`/comunidades/${edificio.comunidad?.id}`)}
                            >
                                {edificio.comunidad?.name || ""}
                            </Typography>
                        </Box>

                        {/* Información adicional */}
                        <Typography variant="body2" color="textSecondary">
                            Creado {moment(edificio.createdAt).fromNow()}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography variant="body1"><strong>Dirección:</strong> {edificio.direccion || edificio.comunidad.direccion}</Typography>
                            <Typography variant="body1"><strong>CP:</strong> {edificio.cp || edificio.comunidad.cp} - Sevilla</Typography>
                            <Typography variant="body1"><strong>Administrador:</strong> {edificio.adminCompany?.name || "Desconocido"}</Typography>
                            <Typography variant="body1"><Button variant="outlined" startIcon={<Phone />} sx={{ mt: "auto" }} onClick={() => setModalContactos(true)}>Ver Contactos</Button></Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{
                    height: "100%",
                    boxShadow: 3,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    p: 3
                }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mt: 1 }}>Últimos Comentarios</Typography>
                        <CommentsList comments={edificio?.comments || []} size={300} />
                        <Button variant="outlined" startIcon={<Add />} sx={{ mt: 3 }} fullWidth onClick={() => setModalComment(true)}>Escribir Comentario</Button>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
                <Card sx={{
                    height: "100%",
                    boxShadow: 3,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    p: 3
                }}>
                    <Typography variant="h6" sx={{ mt: 2 }}>Instalaciones</Typography>
                    <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
                        {edificio.instalaciones.map((inst, index) => (
                            <Tab key={index} label={inst.tipo} icon={getInstalacionIcon(inst.tipo)} />
                        ))}
                        <Tab key="addInst" label="CREAR" icon={<Add sx={{ fontSize: 40, fill: "#4db6ac" }} />} />
                    </Tabs>

                    {tabIndex === edificio.instalaciones.length ? (
                        // Formulario para crear nueva instalación
                        <Card sx={{ mt: 2, p: 2 }}>
                            <Typography variant="h6">Nueva Instalación</Typography>

                            {/* Select para Tipo de Instalación */}
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Tipo de Instalación</InputLabel>
                                <Select
                                    name="tipo"
                                    value={newInstalacion.categoryId || ""} // Aseguramos que siempre tenga un valor válido
                                    onChange={(e) => {
                                        const selectedCategory = tiposInstalacion.find((cat) => cat.id === e.target.value);
                                        if (selectedCategory) {
                                            setNewInstalacion((prev) => ({
                                                ...prev,
                                                categoryId: selectedCategory.id, // Guardamos el ID
                                                tipo: selectedCategory.name, // Guardamos el nombre
                                            }));
                                        }
                                    }}
                                >
                                    {tiposInstalacion.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Input para Descripción */}
                            <TextField
                                fullWidth
                                label="Descripción"
                                name="descripcion"
                                value={newInstalacion.descripcion}
                                onChange={(e) => setNewInstalacion((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                                sx={{ mt: 2 }}
                            />

                            {/* Botón para guardar */}
                            <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreateInstalacion} disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Instalación"}
                            </Button>

                            {/* Mostrar error si ocurre */}
                            {error && <Typography color="error" sx={{ mt: 1 }}>Error al crear instalación</Typography>}
                        </Card>
                    ) : (
                        edificio.instalaciones[tabIndex] && (
                            <Card sx={{ mt: 2, p: 2 }}>
                                <Typography variant="body1">Elementos:</Typography>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Imagen</TableCell>
                                            <TableCell>Ref.</TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>Marca</TableCell>
                                            <TableCell>Descripción</TableCell>
                                            <TableCell align="center">Manuales</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {edificio.instalaciones[tabIndex].elementos.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{ImageWithTooltip({ src: row.producto.image?.url || "/images/photo.png" })}</TableCell>
                                                <TableCell>{row.producto.name}</TableCell>
                                                <TableCell>{row.producto?.subcategory?.name}</TableCell>
                                                <TableCell>{row.producto.brand?.name}</TableCell>
                                                <TableCell>{row.producto.descripcion}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" onClick={() => handleShowManuals(row.producto.manuals)}>
                                                        <Badge badgeContent={row.producto.manuals.length} color="primary">
                                                            <Description />
                                                        </Badge>
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box>
                                                        <IconButton disabled={!hasAccess}  onClick={() => handleUpdateCantidad(row.id, row.cantidad - 1)}><Remove /></IconButton>
                                                        <Typography component="span" sx={{ mx: 1 }}>{row.cantidad}</Typography>
                                                        <IconButton disabled={!hasAccess}  onClick={() => handleUpdateCantidad(row.id, row.cantidad + 1)}><Add /></IconButton>
                                                    </Box></TableCell>
                                                <TableCell align="right"><IconButton disabled={!hasAccess} size="small" color="error" onClick={() => showConfirm("Eliminar Elemento", "¿Seguro que quieres eliminar?", () => handleDeleteElemento(row.id))}><Delete /></IconButton></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button variant="outlined" startIcon={<Add />} sx={{ mt: 2, mr: 2 }} onClick={() => {
                                    setSelectedInstalacion(edificio.instalaciones[tabIndex]);
                                    setModalElement(true);
                                }}>Agregar Elemento</Button>
                                <Button variant="outlined" disabled={!hasAccess} color="error" startIcon={<Delete />} sx={{ mt: 2 }}
                                    onClick={() => showConfirm("Eliminar Instalación", "¿Seguro que quieres eliminar?", () => handleDeleteInstalacion(edificio.instalaciones[tabIndex].id))}
                                >Eliminar Instalacion</Button>
                            </Card>

                        ))}
                </Card>
            </Grid>
            <Modal open={modalComment} onClose={() => setModalComment(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 400, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Añadir Comentario</Typography>
                    <TextField fullWidth multiline rows={3} sx={{ mt: 2 }} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={handleAddComment}>Enviar</Button>
                </Box>
            </Modal>
            <Modal open={modalEdificio} onClose={() => setModalEdificio(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 400, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Añadir Edificio</Typography>
                    <TextField fullWidth sx={{ mt: 2 }} value={newEdificio} onChange={(e) => setNewEdificio(e.target.value)} />
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={handleAddEdificio}>Guardar</Button>
                </Box>
            </Modal>
            <Modal open={Boolean(modalManuals)} onClose={() => setModalManuals(null)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 500, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Manuales</Typography>
                    {modalManuals && manuals.length > 0 ? (
                        manuals.map((manual, index) => (
                            <Typography key={index} sx={{ mt: 1 }}>
                                <a href={manual.documento.url} target="_blank" rel="noopener noreferrer">{manual.name}</a>
                            </Typography>
                        ))
                    ) : (
                        <Typography sx={{ mt: 2 }}>No hay manuales disponibles.</Typography>
                    )}
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setModalManuals(null)}>Cerrar</Button>
                </Box>
            </Modal>
            {/* Modal para agregar elemento */}
            <Modal open={modalElement} onClose={() => setModalElement(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 800, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Añadir Elementos</Typography>
                    <TextField
                        fullWidth
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading ? <Typography>Cargando...</Typography> : (
                        <>
                            <TableContainer sx={{ maxHeight: 300, overflowY: "auto" }}>
                                <Table>
                                    <TableBody>
                                        {productos.map((producto) => (
                                            <TableRow key={producto.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedProducts.some(p => p.id === producto.id)}
                                                        onChange={() => handleSelectProduct(producto)}
                                                    />
                                                </TableCell>
                                                <TableCell><Image src={producto.image?.url || "/images/photo.png"} width={40} height={40} alt="Imagen" style={{ cursor: "pointer", objectFit: "contain" }} /></TableCell>
                                                <TableCell>{producto.name}</TableCell>
                                                <TableCell>{producto.subcategory?.name}</TableCell>
                                                <TableCell>{producto.brand?.name}</TableCell>
                                                <TableCell>{producto.descripcion}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Pagination
                                count={Math.ceil(totalCount / pageSize)}
                                page={page}
                                onChange={handlePageChange}
                                sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                            />
                            {/* Productos seleccionados */}
                            {selectedProducts.length > 0 && (
                                <Box sx={{ mt: 2, maxHeight: 200, overflowY: "auto" }}>
                                    <Typography variant="subtitle1">Productos seleccionados:</Typography>
                                    {selectedProducts.map((product) => (
                                        <Box key={product.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                                            <Typography>{product.name}</Typography>
                                            <Typography>{product.descripcion}</Typography>
                                            <Box>
                                                <IconButton  onClick={() => handleQuantityChange(product.id, -1)}><Remove /></IconButton>
                                                <Typography component="span" sx={{ mx: 1 }}>{product.quantity}</Typography>
                                                <IconButton  onClick={() => handleQuantityChange(product.id, 1)}><Add /></IconButton>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Botón para confirmar */}
                            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddElements} disabled={selectedProducts.length === 0}>
                                Añadir
                            </Button>


                        </>
                    )}
                </Box>
            </Modal>
            <ContactosModal
                modalOpen={modalContactos}
                setModalOpen={setModalContactos}
                title="Contactos del Edificio"
                contactos={edificio.contactos}
                agregarContacto={(nuevo) => handleAgregarContacto(nuevo)}
                deleteContacto={(contactoId) => handleDeleteContacto(contactoId)}
            />
            <ConfirmDialog
                open={confirmData.open}
                onClose={closeConfirm}
                onConfirm={confirmData.onConfirm}
                title={confirmData.title}
                message={confirmData.message}
            />
        </Grid>

    );
}
