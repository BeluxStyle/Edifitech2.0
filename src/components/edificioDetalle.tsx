

import { AntenaIcon, AutomaticDoorIcon, CCTVIcon, ElectricityIcon, FireEstinguisherIcon, IntercomIcon, KeyIcon } from "@/components/CustomIcons";
import { Add, CircleNotifications, Delete, Description, Phone, Remove } from "@mui/icons-material";
import BusinessIcon from "@mui/icons-material/Business";
import { Badge, Box, Button, Card, CardContent, Checkbox, Divider, FormControl, IconButton, InputLabel, MenuItem, Modal, Pagination, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ContactosModal from "./ContactosModal";

import { toast, useCategories, useCommentHandlers, useContactoHandlers, useElementoHandlers, useInstalacionHandlers, useProducts } from "@edifitech-graphql/index";
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


    const { handleCreate: handleCreateCon, handleDelete: handleDeleteCon } = useContactoHandlers()
    const { handleCreate: handleCreateInst, handleDelete: handleDeleteInst } = useInstalacionHandlers()
    const { handleAdd, handleUpdate: handleUpdateEl, handleDelete: handleDeleteEl } = useElementoHandlers()
    const { handlePost } = useCommentHandlers()

    const { data: session } = useSession();

    const { categories } = useCategories()

    const tiposInstalacion = categories || [];


    const [tabIndex, setTabIndex] = useState(0);
    const [manuals, setManuals] = useState([]);
    const [modalManuals, setModalManuals] = useState(false);
    const [modalComment, setModalComment] = useState(false);
    const [modalContactos, setModalContactos] = useState(false);
    const [modalElement, setModalElement] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newInstalacion, setNewInstalacion] = useState({ tipo: "", descripcion: "", categoryId: "", edificioId: edificio.id });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedInstalacion, setSelectedInstalacion] = useState(null);
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


    const [filters, setFilters] = useState({ categoryId: '', brandId: '' });
    const [paginationModel, setPaginationModel] = useState({
        page: 0, // Página inicial (0-based)
        pageSize: 20, // Tamaño de página predeterminado
    });
    const { products: productos, totalCount, loading } = useProducts(searchTerm, paginationModel, filters);

    const handlePageChange = (_, newPage) => {
        setPaginationModel({ ...paginationModel, page: newPage });
    };

    useEffect(() => {
        setFilters({ ...filters, categoryId: selectedInstalacion?.category?.id })
    }, [selectedInstalacion]);

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
        let postcomment = {
            comment: newComment,
            edificioId: edificio.id
        }
        handlePost(postcomment, {
            onSuccess() {
                setModalComment(false);
                setNewComment("")
            },
        })
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
                toast("Debe seleccionar una instalación y al menos un producto.", "error");
                return;
            }
            let elementos = selectedProducts.map(p => ({
                productoId: p.id,
                cantidad: p.quantity
            }))
    
            handleAdd(selectedInstalacion.id, elementos,
                {
                    onSuccess() {
                        setModalElement(false);
                        setSelectedProducts([]);
                    },
                })
        };

    const handleUpdateCantidad = async (elementoId, nuevaCantidad) => {
            if (!elementoId || nuevaCantidad < 1) {
                toast("Cantidad inválida o ID de elemento no válido.", "error");
                return;
            }
    
                handleUpdateEl(elementoId, nuevaCantidad)
    
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
                            <Button variant="contained" sx={{ mt: 2 }}
                                onClick={() => handleCreateInst(
                                    newInstalacion, {
                                    onSuccess() {
                                        setNewInstalacion({ tipo: "", descripcion: "", categoryId: "", edificioId: edificio.id })
                                    },

                                })}
                                disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Instalación"}
                            </Button>
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
                                                        <IconButton disabled={!hasAccess} onClick={() => handleUpdateCantidad(row.id, row.cantidad - 1)}><Remove /></IconButton>
                                                        <Typography component="span" sx={{ mx: 1 }}>{row.cantidad}</Typography>
                                                        <IconButton disabled={!hasAccess} onClick={() => handleUpdateCantidad(row.id, row.cantidad + 1)}><Add /></IconButton>
                                                    </Box></TableCell>
                                                <TableCell align="right"><IconButton disabled={!hasAccess} size="small" color="error" onClick={() => handleDeleteEl(row.id)}><Delete /></IconButton></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button variant="outlined" startIcon={<Add />} sx={{ mt: 2, mr: 2 }} onClick={() => {
                                    setSelectedInstalacion(edificio.instalaciones[tabIndex]);
                                    setModalElement(true);
                                }}>Agregar Elemento</Button>
                                <Button variant="outlined" disabled={!hasAccess} color="error" startIcon={<Delete />} sx={{ mt: 2 }}
                                    onClick={() => handleDeleteInst(edificio.instalaciones[tabIndex].id)}
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
                                page={paginationModel.page}
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
                                                <IconButton onClick={() => handleQuantityChange(product.id, -1)}><Remove /></IconButton>
                                                <Typography component="span" sx={{ mx: 1 }}>{product.quantity}</Typography>
                                                <IconButton onClick={() => handleQuantityChange(product.id, 1)}><Add /></IconButton>
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
                agregarContacto={(nuevo) => handleCreateCon({ ...nuevo, edificioId: edificio.id }, {})}
                deleteContacto={(contactoId) => handleDeleteCon(contactoId)}
            />
        </Grid>

    );
}
