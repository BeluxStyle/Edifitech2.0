
import { AntenaIcon, AutomaticDoorIcon, CCTVIcon, ElectricityIcon, FireEstinguisherIcon, IntercomIcon, KeyIcon } from "@/components/CustomIcons";
import { EdificioInput, Instalacion, Manual, toast, useCategories, useCommentHandlers, useContactoHandlers, useEdificioHandlers, useElementoHandlers, useInstalacionHandlers, useProducts } from "@edifitech-graphql/index";
import { Add, CircleNotifications, Delete, Description, FileOpen, Phone, Remove } from "@mui/icons-material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { Badge, Box, Button, Card, CardContent, Checkbox, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Modal, Pagination, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, TooltipProps, Typography, tooltipClasses } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { styled } from "@mui/material/styles";
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { useRouter } from "next/navigation"; // Correcto para App Router
import { useEffect, useMemo, useState } from "react";
import CommentsList from "./CommentList";
import ContactosModal from "./ContactosModal";
import ManualsModal from "./ManualsModal"

moment().locale('es');



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

export default function DetalleComunidad({ comunidad }) {

    const router = useRouter();

    const { handleCreate: handleCreateEd, handleDelete: handleDeleteEd } = useEdificioHandlers()
    const { handleCreate: handleCreateCon, handleDelete: handleDeleteCon } = useContactoHandlers()
    const { handleCreate: handleCreateInst, handleDelete: handleDeleteInst } = useInstalacionHandlers()
    const { handleAdd, handleUpdate: handleUpdateEl, handleDelete: handleDeleteEl } = useElementoHandlers()
    const { handlePost } = useCommentHandlers()

    const { data: session } = useSession();

    const { categories } = useCategories();

    const tiposInstalacion = categories || [];

    const [tabIndex, setTabIndex] = useState(0);
    const [product, setProduct] = useState();
    const [manuals, setManuals] = useState([]);
    const [modalManuals, setModalManuals] = useState(false);
    const [modalComment, setModalComment] = useState(false);
    const [modalContactos, setModalContactos] = useState(false);
    const [modalEdificio, setModalEdificio] = useState(false);
    const [modalElement, setModalElement] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newEdificio, setNewEdificio] = useState("");
    const [newInstalacion, setNewInstalacion] = useState({ tipo: "", descripcion: "", categoryId: "", comunidadId: comunidad.id });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<Array<any>>([]);
    const [selectedInstalacion, setSelectedInstalacion] = useState<Instalacion | null>(null);

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
        setFilters({ ...filters, categoryId: selectedInstalacion?.category?.id || '' })
    }, [selectedInstalacion]);




    const handleSelectProduct = (producto) => {
        setSelectedProducts((prev) => {
            const exists = prev.find(p => p.id === producto.id);
            if (exists) {
                return prev.filter(p => p.id !== producto.id);
            }
            return [...prev, { ...producto, quantity: 1, instalacionId: selectedInstalacion?.id }];
        });
    };


    const handleAddComment = async () => {
        let postcomment = {
            comment: newComment,
            comunidadId: comunidad.id
        }
        handlePost(postcomment, {
            onSuccess() {
                setModalComment(false);
                setNewComment("")
            },
        })
    };
    const handleAddEdificio = async () => {

        const input: EdificioInput = {
            name: newEdificio,
            direccion: comunidad.direccion,
            cp: comunidad.cp,
            comunidadId: comunidad.id
        }

        handleCreateEd(input, {
            onSuccess() {
                setModalEdificio(false);
            },
        })
    };

    const handleShowManuals = (product) => {
        setManuals(product.manuals)
        setProduct(product);
        setModalManuals(true);
    };


    const handleQuantityChange = (id, delta) => {
        setSelectedProducts((prev) => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
    };

    const handleAddElements = async () => {
        if (!selectedInstalacion?.id || selectedProducts.length === 0) {
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
                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Contenedor alineado para el nombre de la comunidad */}
                        <Box display="flex" flexDirection="column">
                            <Box display="flex" alignItems="center" gap={1}>
                                <ApartmentIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h4" fontWeight="bold">{comunidad.name}</Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Creado {moment(comunidad.createdAt).fromNow()}
                            </Typography>
                        </Box>

                        <Divider />

                        {/* Información de la comunidad */}
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography variant="body1"><strong>Dirección:</strong> {comunidad.direccion}</Typography>
                            <Typography variant="body1"><strong>CP:</strong> {comunidad.cp} - Sevilla</Typography>
                            <Typography variant="body1"><strong>Administrador:</strong> {comunidad.adminCompany?.name || "Desconocido"}</Typography>
                            <Typography variant="body1"><Button variant="outlined" startIcon={<Phone />} sx={{ mt: "auto" }} onClick={() => setModalContactos(true)}>Ver Contactos</Button>
                            </Typography>
                        </Box>

                        <Divider />

                        {/* Sección de comentarios */}
                        <Typography variant="h6">Últimos Comentarios</Typography>
                        <Box >
                            <CommentsList comments={comunidad?.comments} size={150} />
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            sx={{ mt: "auto" }}
                            onClick={() => setModalComment(true)}
                            disabled={!addAccess}
                        >
                            Escribir Comentario
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

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
                    <CardContent>
                        <Typography variant="h6" sx={{ mt: 1 }}>Edificios</Typography>
                        <TableContainer sx={{ pb: 4, maxHeight: 450, overflowY: "auto" }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Instalaciones</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...comunidad.edificios]
                                        .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente por name
                                        .map((edificio) => (
                                            <TableRow key={edificio.id} sx={{
                                                cursor: "pointer",
                                                borderBottom: "1px solid #ddd",
                                                "&:hover": { backgroundColor: "#f9f9f9" }
                                            }} onClick={() => { router.push(`/edificios/${edificio.id}`) }}>
                                                <TableCell>{edificio.name}</TableCell>
                                                <TableCell>{edificio.instalaciones.map((inst, index) => (
                                                    <span key={index} style={{ marginRight: 8 }}>{getInstalacionIcon(inst.tipo)}</span>
                                                ))}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        disabled={!hasAccess}
                                                        onClick={(e) => {
                                                            e.stopPropagation(),
                                                                handleDeleteEd(edificio.id)
                                                        }}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant="outlined" disabled={!addAccess} startIcon={<Add />} fullWidth sx={{ mt: "auto" }} onClick={() => setModalEdificio(true)}>Agregar Edificio</Button>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 2, md: 12 }}>
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
                        {comunidad.instalaciones.map((inst) => (
                            <Tab key={inst.id} label={inst.tipo} icon={getInstalacionIcon(inst.tipo)} />
                        ))}
                        <Tab key="addInst" disabled={!addAccess} label="CREAR" icon={<Add sx={{ fontSize: 40, fill: "#4db6ac" }} />} />
                    </Tabs>

                    {tabIndex === comunidad.instalaciones.length ? (
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
                                        setNewInstalacion({ tipo: "", descripcion: "", categoryId: "", comunidadId: comunidad.id })
                                    },

                                })}
                                disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Instalación"}
                            </Button>
                        </Card>
                    ) : (
                        comunidad.instalaciones[tabIndex] && (
                            <Card sx={{ mt: 2, p: 2 }}>
                                <Typography variant="body1">Elementos:</Typography>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Imagen</TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>Ref.</TableCell>
                                            <TableCell>Marca</TableCell>
                                            <TableCell>Descripción</TableCell>
                                            <TableCell align="center">Manuales</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {comunidad.instalaciones[tabIndex].elementos.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{ImageWithTooltip({ src: row.producto?.image?.url || "/images/photo.png" })}</TableCell>
                                                <TableCell>{row.producto?.subcategory?.name}</TableCell>
                                                <TableCell>{row.producto?.name}</TableCell>
                                                <TableCell>{row.producto?.brand?.name}</TableCell>
                                                <TableCell>{row.producto?.descripcion}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton size="small" color={row.producto?.manuals.length ? "primary" : "default"} onClick={() => handleShowManuals(row.producto)}>
                                                        <Badge badgeContent={row.producto?.manuals.length} color="primary">
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
                                                <TableCell align="right"><IconButton size="small" color="error" disabled={!hasAccess} onClick={() => handleDeleteEl(row.id)}><Delete /></IconButton></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button disabled={!addAccess} variant="outlined" startIcon={<Add />} sx={{ mt: 2, mr: 2 }} onClick={() => {
                                    setSelectedInstalacion(comunidad.instalaciones[tabIndex]);

                                    setModalElement(true);
                                }}>Agregar Elemento</Button>
                                <Button variant="outlined" color="error" startIcon={<Delete />} sx={{ mt: 2 }}
                                    disabled={!hasAccess} onClick={() => handleDeleteInst(comunidad.instalaciones[tabIndex].id)}
                                >Eliminar Instalacion</Button>
                            </Card>

                        ))}
                </Card>
            </Grid>
            <Modal open={modalComment} onClose={() => setModalComment(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 400, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Añadir Comentario</Typography>
                    <TextField fullWidth multiline rows={3} sx={{ mt: 2 }} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <Button variant="outlined" sx={{ mt: 2 }}
                        onClick={handleAddComment}>Enviar</Button>
                </Box>
            </Modal>
            <Modal open={modalEdificio} onClose={() => setModalEdificio(false)}>
                <Box sx={{ p: 3, backgroundColor: "white", width: 400, margin: "auto", mt: 10 }}>
                    <Typography variant="h6">Añadir Edificio</Typography>
                    <TextField fullWidth sx={{ mt: 2 }} value={newEdificio} onChange={(e) => setNewEdificio(e.target.value)} />
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={handleAddEdificio}>Guardar</Button>
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
                                count={Math.ceil(totalCount / paginationModel.pageSize)}
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
            <ManualsModal
                modalOpen={modalManuals}
                setModalOpen={setModalManuals}
                product={product}
                manuals={manuals}
            />
            <ContactosModal
                modalOpen={modalContactos}
                setModalOpen={setModalContactos}
                title="Contactos de la Comunidad"
                contactos={comunidad.contactos}
                agregarContacto={(nuevo) => handleCreateCon({ ...nuevo, comunidadId: comunidad.id }, {})}
                deleteContacto={(contactoId) => handleDeleteCon(contactoId)}
            />
        </Grid>

    );
}
