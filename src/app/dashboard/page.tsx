'use client';

import PageContainer from '@/components/PageContainer';
import { COUNT_DATA } from '@/graphql/queries';
import { useQuery } from '@apollo/client';
import { AccountCircle, Apartment, AssignmentLate, BrandingWatermark, Business, Category, Collections, Construction, ContactPhone, Description, ListAlt, Loyalty, People, Plagiarism, Store, SupervisedUserCircle } from '@mui/icons-material';
import { Box, Card, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DashboardPage = () => {
  const { data: session } = useSession();

  const [role, setRole] = useState(0);
  const router = useRouter();
  const { data: dataCount, loading } = useQuery(COUNT_DATA);
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && dataCount) {
      setStats({
        users: dataCount.countUsers,
        comunities: dataCount.countComunidades,
        products: dataCount.countProductos,
        manuals: dataCount.countManuals,
        buildings: dataCount.countEdificios,
        roles: dataCount.countRoles,
        images: dataCount.countImages,
        categories: dataCount.countCategories,
        brands: dataCount.countBrands,
        companies: dataCount.countCompanies,
        subscriptions: dataCount.countSubscriptions,
        documents: dataCount.countDocuments,
        instalaciones: dataCount.countInstalaciones
      });
    }
  }, [loading, dataCount]);


  useEffect(() => {
    if (session) {
      setRole(session.user?.role?.level || 0);
    }
  }, [session]);



  useEffect(() => {

    // Simulación de carga de datos

    setNews([
      { id: 1, title: 'Nuevo producto lanzado', link: '#' },
      { id: 2, title: 'Mantenimiento programado', link: '#' },
    ]);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#F08042', '#FF7042', '#006042', '#FF5042', '#004042', '#FF3042', '#0F2042', '#AA1042', '#FF0042'];
  const colorHover = {
    fontSize: 50, // Tamaño del icono
    color: "#3da2d0", // Color inicial
    transition: "color 0.3s ease", // Transición suave
    "&:hover": {
      color: "#ae10c9", // Color al pasar el ratón
    },
    "&:active": {
      color: "blue", // Color al hacer clic
    },
  }

  const sections = [
    { name: 'Perfil', icon: <AccountCircle sx={colorHover} />, link: '/profile', role: 0 },
    { name: 'Avisos', icon: <AssignmentLate sx={colorHover} />, link: '/avisos', role: 2, count: stats?.avisos },
    { name: 'Comunidades', icon: <Apartment sx={colorHover} />, link: '/comunidades', role: 2, count: stats?.comunities },
    { name: 'Edificios', icon: <Business sx={colorHover} />, link: '/edificios', role: 5, count: stats?.buildings },
    { name: 'Productos', icon: <ListAlt sx={colorHover} />, link: '/productos', role: 1, count: stats?.products },
    { name: 'Manuales', icon: <Plagiarism sx={colorHover} />, link: '/manuales', role: 1, count: stats?.manuals },
    { name: 'Contactos', icon: <ContactPhone sx={colorHover} />, link: '/admin/contactos', role: 5, count: stats?.contactos },
    { name: 'Documentos', icon: <Description sx={colorHover} />, link: '/documentos', role: 2, count: stats?.documents },
    { name: 'Usuarios', icon: <People sx={colorHover} />, link: '/admin/usuarios', role: 99, count: stats?.users },
    { name: 'Imágenes', icon: <Collections sx={colorHover} />, link: '/admin/imagenes', role: 5, count: stats?.images },
    { name: 'Categorías', icon: <Category sx={colorHover} />, link: '/admin/categorias', role: 5, count: stats?.categories },
    { name: 'Marcas', icon: <BrandingWatermark sx={colorHover} />, link: '/admin/marcas', role: 5, count: stats?.brands },
    { name: 'Empresas', icon: <Store sx={colorHover} />, link: '/admin/empresas', role: 99, count: stats?.companies },
    { name: 'Instalaciones', icon: <Construction sx={colorHover} />, link: '/admin/instalaciones', role: 99, count: stats?.instalaciones },
    { name: 'Roles', icon: <SupervisedUserCircle sx={colorHover} />, link: '/admin/roles', role: 99, count: stats?.roles },
    { name: 'Subscripciones', icon: <Loyalty sx={colorHover} />, link: '/admin/subscripciones', role: 99, count: stats?.subscriptions },
  ];

  const filteredSections = sections.filter((section) => section.role <= role);

  const data = sections.filter((section) => section.count >= 1);

  return (
    <PageContainer>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard: {" "}
          <Box component="span" sx={{ fontWeight: "bold", color: "primary.main" }}>
            {session?.user?.name}
          </Box>
        </Typography>

        <Box style={{ marginBottom: 20 }}>
          <Typography variant="h6">Noticias</Typography>
          <ul>
            {news.map((item) => (
              <li key={item.id}>
                <Link href={item.link} style={{ textDecoration: 'none', color: '#3f51b5' }}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </Box>

        <Grid container spacing={1}>
          {filteredSections.map((section) => (
            <Grid size={{ xs: 6, sm: 4, md: 1.5 }} key={section.name}>
              <Card onClick={() => router.push(section.link)} style={{ position: 'relative', textAlign: 'center', padding: '16px', cursor: 'pointer', minHeight: 160 }}>
                <Typography variant="h6" style={{ marginTop: 8 }}>{section.name}</Typography>
                {section.icon}
                <Typography variant="h6" style={{ color: 'grey' }}>
                  {section.count || ""}
                </Typography>

              </Card>
            </Grid>
          ))}
        </Grid>



        <Grid container spacing={2} style={{ marginTop: 20 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6">Gráfica de Datos</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3f51b5" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6">Distribución de Datos</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="count" label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>


      </Box>
    </PageContainer>
  );
};

export default DashboardPage;
