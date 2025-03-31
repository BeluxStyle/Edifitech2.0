"use client";

import { useParams } from "next/navigation";

import { EdifitechLoading } from "@/components/CustomIcons";
import PageContainer from "@/components/PageContainer";
import { GET_EDIFICIO } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";

import DetalleEdificio from "@/components/edificioDetalle";



export default function EdificioPage() {

  
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error } = useQuery(GET_EDIFICIO, { variables: { id } , fetchPolicy: "cache-and-network" });
  //const { data: productData, loading: productLoading, error: productError } = useQuery(GET_PRODUCTS);

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%",
            gap: 2,
          }}
        >
          <EdifitechLoading sx={{height: 100, width: 100, fill: "secondary"}} />
          <Box sx={{ width: "50%" }}>
            <Typography variant="body2" align="center">Cargando...</Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }
  
  if (error || !data?.getEdificio) return <Typography variant="h6" color="error">Edificio no encontrado</Typography>;


  return (
    <PageContainer>
    <Box sx={{ p: 1}}>    
      <DetalleEdificio edificio={data.getEdificio} ></DetalleEdificio>
    </Box>
    </PageContainer>
  );
}
