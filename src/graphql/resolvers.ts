import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { ComunidadInput, ContactoInput, EdificioInput, ElementoInput, InstalacionInput, ManualInput, ProductoInput, DocumentInput } from "@/lib/types";
import { create } from "domain";



const prisma = new PrismaClient();

export const resolvers = {
  User: {
    hasPassword: (parent) => Boolean(parent.password),
  },
  Comment: {
    averageRating: async (parent, _, { prisma }) => {
      const ratings = await prisma.comment.findMany({
        where: { id: parent.id },
        select: { rating: true }
      });
      const validRatings = ratings.map(r => r.rating).filter(r => r !== null);
      return validRatings.length ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length : 0;
    }
  },
  Producto: {
    name: (parent) => {
      return parent.brand
        ? `${parent.brand.name.slice(0, 3).toUpperCase()} - ${parent.ref}`
        : parent.ref; // Si no tiene brand, usa solo la ref
    }
  },
  Edificio: {
    label: (parent) => {
      return parent.comunidad
        ? `${parent.comunidad.name} - ${parent.name}`
        : parent.name; // Si no tiene brand, usa solo la ref
    }
  },
  Query: {

    // Queries existentes
    me: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.user.findUnique({
        where: { id: context.session.user.id },
        include: {
          role: true,
          company: { include: { users: true, owner: true } },
          accounts: true,
          userSubscriptions: true,

        },
      });
    },
    listUsers: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.user.findMany({
        include: {
          role: true,
          company: true,
          accounts: true,
          userSubscriptions: {
            include: { subscription: true }
          }
        }
      });
    },
    countUsers: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.user.count();
    },
    listRoles: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.rol.findMany({ include: { users: true } });
    },
    countRoles: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.rol.count();
    },
    getRole: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.rol.findUnique({ where: { id } });
    },
    getUser: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.user.findUnique({
        where: { id },
        include: { role: true, company: true, accounts: true, userSubscriptions: true },
      });
    },
    getComments: async (_, { comunidadId, edificioId }, { prisma }) => {
      return prisma.comment.findMany({
        where: {
          comunidadId: comunidadId || undefined,
          edificioId: edificioId || undefined,
          deletedAt: null
        },
        include: { author: true, replies: true, reactions: true }
      });
    },
    subscriptions: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.subscription.findMany({
        include: {
          userSubscriptions: { include: { user: true } },
          companySubscriptions: { include: { company: true } }
        }
      });
    },
    countSubscriptions: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.subscription.count();
    },
    getCompany: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.company.findUnique({ where: { id } });
    },
    listCompanies: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.company.findMany({
        include: {
          comunidades: true, users: true, companySubscriptions: {
            include: { subscription: true }
          }
        }
      });
    },
    countCompanies: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.count();
    },
    getComunidad: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.comunidad.findUnique({
        where: { id },
        include: {
          adminCompany: true,
          contactos: { include: { comunidad: true, edificio: { include: { comunidad: true } } } },
          comments: {
            include: {
              comunidad: true,
              edificio: true,
              replies: { include: { author: true } },
              author: true,
              reactions: true
            }
          },
          instalaciones: {
            include: {
              category: true,
              elementos: {
                include: {
                  producto: {
                    include: {
                      image: true,
                      brand: true,
                      manuals: { include: { documento: true } },
                      subcategory: { include: { categoria: true } }
                    }
                  }
                }
              }
            }
          },
          edificios: {
            include: {
              instalaciones: {
                include: {
                  elementos: {
                    include: {
                      producto: {
                        include: {
                          image: true,
                          brand: true,
                          manuals: { include: { documento: true } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    },
    listComunidades: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.comunidad.findMany({ include: { edificios: true, adminCompany: true, instalaciones: true, contactos: true } });
    },
    countComunidades: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.comunidad.count();
    },
    getEdificio: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.edificio.findUnique({
        where: { id },
        include: {
          comunidad: true,
          adminCompany: true,
          contactos: { include: { comunidad: true, edificio: { include: { comunidad: true } } } },
          comments: {
            include: {
              comunidad: true,
              edificio: true,
              replies: { include: { author: true } },
              author: true,
              reactions: true
            }
          },
          instalaciones: {
            include: {
              category: true,
              elementos: {
                include: {
                  producto: {
                    include: {
                      image: true,
                      brand: true,
                      manuals: { include: { documento: true } },
                      subcategory: { include: { categoria: true } }
                    }
                  }
                }
              }
            }
          }
        }
      });
    },
    listEdificios: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.edificio.findMany({ include: { instalaciones: true, comunidad: true, adminCompany: true } });
    },
    countEdificios: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.edificio.count();
    },
    getInstalacion: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.instalacion.findUnique({ where: { id } });
    },
    listInstalaciones: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.instalacion.findMany({ 
        include: { 
          edificio: { 
            include: { 
              comunidad: true 
            } 
          }, 
          comunidad: true,
          elementos: { 
            include: { 
              producto: true 
            } 
          }, 
          installerCompany: true 
        } 
      });
    },
    countInstalaciones: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.instalacion.count();
    },
    getElemento: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.elemento.findUnique({ where: { id } });
    },
    listElementos: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");

      return prisma.elemento.findMany();
    },
    getProducto: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.producto.findUnique({ where: { id } });
    },
    listProductos: async (_parent: unknown, { searchTerm, page, pageSize, categoryId }: { searchTerm: string, page: number, pageSize: number, categoryId: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      const where = {
        AND: [
          ...(searchTerm
            ? [
              {
                OR: [
                  { ref: { contains: searchTerm } },
                  { descripcion: { contains: searchTerm } },
                ],
              },
            ]
            : []),
          ...(categoryId ? [{ subcategory: { categoria: { id: categoryId } } }] : []),
        ],
      };

      const productos = await prisma.producto.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          elementos: true,
          manuals: { include: { documento: true } },
          brand: true,
          subcategory: { include: { categoria: true } },
          image: true,
        },
      });
      const totalCount = await prisma.producto.count({ where });
      return {
        productos,
        totalCount,
      };
    },
    countProductos: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.producto.count();
    },
    getBrand: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.brand.findUnique({ where: { id } });
    }
    ,
    listBrands: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.brand.findMany({ include: { productos: true } });
    },
    countBrands: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.brand.count();
    },
    getImage: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.image.findUnique({ where: { id } });
    }
    ,
    listImages: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.image.findMany();
    },
    countImages: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.image.count();
    },
    getManual: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.manual.findUnique({ where: { id } });
    }
    ,
    listManuals: async (
      _parent: unknown,
      { searchTerm, page, pageSize }: { searchTerm: string; page: number; pageSize: number },
      context: { session: Session }
    ) => {
      // Verificar autenticación
      if (!context.session?.user?.id) throw new Error("No autenticado");
    
      // Construir el filtro dinámico
      const where = {
        AND: [
          ...(searchTerm
            ? [
                {
                  OR: [
                    { name: { contains: searchTerm } }, // Buscar por nombre
                    { description: { contains: searchTerm } }, // Buscar por descripción
                  ],
                },
              ]
            : []),
        ],
      };
    
      // Consulta para obtener los manuales
      const manuals = await prisma.manual.findMany({
        where,
        skip: (page - 1) * pageSize, // Paginación: Saltar registros
        take: pageSize, // Número de registros por página
        include: {
          documento: true, // Incluir el documento asociado
          productos: true, // Incluir los productos asociados
        },
      });
    
      // Contar el total de manuales que coinciden con el filtro
      const totalCount = await prisma.manual.count({ where });
    
      // Retornar los resultados
      return {
        manuals,
        totalCount,
      };
    },
    countManuals: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.manual.count();
    },
    getDocument: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.document.findUnique({ where: { id } });
    }
    ,
    listDocuments: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.document.findMany({ include: { manuals: true } });
    },
    countDocuments: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.document.count();
    },
    getCategory: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.category.findUnique({ where: { id } });
    }
    ,
    listCategories: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.category.findMany({ include: { instalaciones: true, subcategorias: { include: { productos: true }, } } });
    },
    countCategories: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.category.count();
    },
    getSubcategory: async (_parent: unknown, { id }: { id: string }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.subcategory.findUnique({ where: { id } });
    }
    ,
    listSubcategories: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.subcategory.findMany({ include: { productos: true, categoria: true } });
    },
    listContactos: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("no autenticado");
      return prisma.contacto.findMany({ include: { comunidad: true, edificio: { include: { comunidad:true}} } });
    },
    countContactos: async (_parent: unknown, _args: unknown, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.contacto.count();
    },
    // ... (añadir más queries según sea necesario)
  },
  Mutation: {

    importProducts: async (_, { data }) => {
      try {
        // Validar los datos antes de insertarlos
        const validatedData = data.map((item) => ({
          ref: item.ref,
          ean: item.ean,
          price: parseFloat(item.price),
          descripcion: item.descripcion,
          brandId: item.brandId,
          subcategoryId: item.subcategoryId,
          imageId: item.imageId,
        }));

        // Usar createMany para insertar los datos
        await prisma.producto.createMany({
          data: validatedData,
          skipDuplicates: true, // Evitar duplicados basados en las restricciones del modelo
        });

        return {
          success: true,
          message: 'Productos importados correctamente',
        };
      } catch (error) {
        console.error('Error al importar productos:', error);
        throw new Error('Error al importar productos');
      }
    },
    importManuales: async (_, { data }) => {
      try {
        // Prepare an array for createMany operation
        const manualDataForCreateMany = [];
        const relationPromises = [];

        // Process each item in the input data
        for (const item of data) {
          const { name, url, referencias } = item;

          // Ensure referencias is a string
          const referenciasString = typeof referencias === "string" ? referencias : "";
          console.log("🔍 Referencias String:", referenciasString);

          // Use regex to find all numbers after "Ref:"
          const referenciasNumeros = referenciasString
            .match(/Ref:\s*(\d+)/gi)
            ?.map((match) => match.replace(/Ref:\s*/, "").trim()) || [];
          console.log("📌 Referencias extraídas:", referenciasNumeros);

          if (referenciasNumeros.length === 0) {
            console.warn(`⚠️ No se encontraron referencias en: "${referenciasString}"`);
          }

          // Check if document exists, else create it
          let documento = await prisma.document.findUnique({ where: { url } });
          if (!documento) {
            documento = await prisma.document.create({ data: { url } });
          }

          // Add basic data for createMany
          manualDataForCreateMany.push({
            name,
            description: referenciasString, // Save original string as description
            documentoId: documento.id,
          });

          // Search products in DB by reference
          const productosExistentesPromise = prisma.producto.findMany({
            where: { ref: { in: referenciasNumeros } },
            select: { id: true, ref: true },
          }).then(productosExistentes => {
            console.log("🔗 Productos encontrados en BD:", productosExistentes.length);
            return { manualName: name, productoIds: productosExistentes.map(p => p.id) };
          });

          relationPromises.push(productosExistentesPromise);
        }

        // Create many manuals at once
        await prisma.manual.createMany({
          data: manualDataForCreateMany,
          skipDuplicates: true // Skip duplicates based on unique constraints
        });

        console.log("✅ Manuales creados con createMany:", manualDataForCreateMany.length);

        // Once manuals are created, resolve promises for connecting products
        const resolvedRelations = await Promise.all(relationPromises);

        // Connect found products to corresponding manuals
        for (const relation of resolvedRelations) {
          if (relation.productoIds.length > 0) {
            const manual = await prisma.manual.findFirst({
              where: { name: relation.manualName }
            });

            if (manual) {
              await prisma.manual.update({
                where: { id: manual.id },
                data: {
                  productos: { connect: relation.productoIds.map(id => ({ id })) }
                }
              });
            }
          }
        }

        return {
          success: true,
          message: "Manuales importados correctamente",
        };
      } catch (error) {
        console.error("❌ Error al importar manuales:", error);
        throw new Error("Error al importar manuales");
      }
    },


    // Mutations existentes
    createManual: async (_, { input }, { prisma }) => {
      try {
        const { name, url, description, referencias } = input;
    
        // Validar que los campos obligatorios estén presentes
        if (!name || !url || !referencias) {
          throw new Error("El nombre, la URL y las referencias son obligatorios.");
        }
    
        // Buscar o crear el documento asociado al manual
        let documento = await prisma.document.findUnique({ where: { url } });
        if (!documento) {
          documento = await prisma.document.create({ data: { url } });
        }
    
        // Extraer las referencias de productos usando regex (asumiendo formato "Ref: 12345")
        const referenciasNumeros = referencias
          .match(/Ref:\s*(\d+)/gi)
          ?.map((match) => match.replace(/Ref:\s*/, "").trim()) || [];
    
        if (referenciasNumeros.length === 0) {
          console.warn(`⚠️ No se encontraron referencias válidas en: "${referencias}"`);
        }
    
        // Crear el manual
        const manual = await prisma.manual.create({
          data: {
            name,
            description: description || "", // La descripción es opcional
            documentoId: documento.id,
          },
        });
    
        // Buscar productos por sus referencias
        const productosExistentes = await prisma.producto.findMany({
          where: { ref: { in: referenciasNumeros } },
          select: { id: true, ref: true },
        });
    
        console.log(`🔗 Productos encontrados en BD: ${productosExistentes.length}`);
    
        // Conectar los productos encontrados al manual
        if (productosExistentes.length > 0) {
          await prisma.manual.update({
            where: { id: manual.id },
            data: {
              productos: {
                connect: productosExistentes.map((producto) => ({ id: producto.id })),
              },
            },
          });
        }
    
        return {
          success: true,
          message: "Manual creado correctamente",
          manual,
        };
      } catch (error) {
        console.error("❌ Error al crear el manual:", error);
        throw new Error("Error al crear el manual");
      }
    },
    createUser: async (
      _parent: unknown,
      { name, email, password }: { name: string; email: string; password: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const userRole = await prisma.rol.findUnique({
        where: { name: 'user' },
      });
      let hashedPassword = null;

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      return prisma.user.create({
        data: { name, email, password: hashedPassword, role: { connect: { id: userRole?.id } } },
      });
    },
    updateUser: async (
      _parent: unknown,
      { id, name, email, roleId }: { id: string; name: string; email: string; roleId: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.user.update({
        where: { id },
        data: { name, email, role: { connect: { id: roleId } } },
      });
    },
    changePassword: async (
      _parent: unknown,
      { id, password }: { id: string; password: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
    },
    checkPassword: async (
      _parent: unknown,
      { id, password }: { id: string; password: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error("Usuario no encontrado");
      const valid = await bcrypt.compare(password, user.password);
      return valid
    }
    ,
    deleteUser: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.user.delete({ where: { id } });
      return deleted !== null;
    },
    createRole: async (
      _parent: unknown,
      { name, level }: { name: string; level: number; },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.rol.create({
        data: { name, level, },
      });
    },
    updateRole: async (
      _parent: unknown,
      { id, name, level }: { id: string; name: string; level: number; },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.rol.update({
        where: { id },
        data: { name, level, },
      });
    },
    deleteRole: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      console.log("Borrando rol id", id);
      const deleted = await prisma.rol.delete({ where: { id } });
      return deleted !== null;
    },
    createBrand: async (
      _parent: unknown,
      { input }: { input: { name: string; } },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.brand.create({ data: input });
    },
    updateBrand: async (
      _parent: unknown,
      { id, name }: { id: string; name: string; },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.brand.update({
        where: { id },
        data: { name },
      });
    },
    deleteBrand: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.brand.delete({ where: { id } });
      return deleted !== null;
    },
    createSubscription: async (
      _parent: unknown,
      { duration,
        isLifetime,
        isTrial,
        name,
        price }: {
          duration: number,
          isLifetime: boolean,
          isTrial: boolean,
          name: string,
          price: number
        },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.subscription.create({
        data: {
          duration,
          isLifetime,
          isTrial,
          name,
          price
        },
      });
    },
    // ... (resto de las mutations existentes)

    // Nuevas mutations
    createCompany: async (
      _parent: unknown,
      { input },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.create({ data: input });
    },

    removeUserFromCompany: async (
      _parent: unknown,
      { userId, companyId }: {
        userId
        : string, companyId: string
      },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.update({
        where: { id: companyId },
        data: {
          users: {
            disconnect: { id: userId }
          }
        },
        include: {
          users: true, // Incluir los usuarios actualizados en la respuesta
        },
      });
    }
    ,
    addUserToCompany: async (
      _parent: unknown,
      { userId, companyId }: {
        userId
        : string, companyId: string
      },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.update({
        where: { id: companyId },
        data: {
          users: { connect: { id: userId }
        }
        },
        include: {
          users: true, // Incluir los usuarios actualizados en la respuesta
        },
      });
    }
    ,
    addCommunityToCompany: async (
      _parent: unknown,
      { comunidadId, companyId }: {
        comunidadId
        : string, companyId: string
      },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.update({
        where: { id: companyId },
        data: {
          comunidades: { connect: { id: comunidadId } }
        },
        include: { comunidades: true }

      });
    },

    removeCommunityFromCompany : async (
      _parent: unknown,
      { comunidadId, companyId }: {
        comunidadId
        : string, companyId: string
      },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.update({
        where: { id: companyId },
        data: {
          comunidades: {
            disconnect: { id: comunidadId }
          }
        },
        include: { comunidades: true }
      });
    },



    updateCompany: async (
      _parent: unknown,
      { id, input }: { id: string, input: ComunidadInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.company.update({ where: { id }, data: input });
    },
    deleteCompany: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.company.delete({ where: { id } });
      return deleted !== null;
    },

    createComunidad: async (
      _parent: unknown,
      { input },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.comunidad.create({ data: input });
    },
    updateComunidad: async (
      _parent: unknown,
      { id, input }: { id: string, input: ComunidadInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.comunidad.update({ where: { id }, data: input });
    },
    deleteComunidad: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.comunidad.delete({ where: { id } });
      return deleted !== null;
    },

    createEdificio: async (
      _parent: unknown,
      { input },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.edificio.create({ data: input });
    },
    updateEdificio: async (
      _parent: unknown,
      { id, input }: { id: string, input: EdificioInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.edificio.update({ where: { id }, data: input });
    },
    deleteEdificio: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.edificio.delete({ where: { id } });
      return deleted !== null;
    },

    createInstalacion: async (
      _parent: unknown,
      { input },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.instalacion.create({ data: input });
    },
    updateInstalacion: async (
      _parent: unknown,
      { id, input }: { id: string, input: InstalacionInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.instalacion.update({ where: { id }, data: input });
    },
    deleteInstalacion: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.instalacion.delete({ where: { id } });
      return deleted !== null;
    },

    createElemento: async (
      _parent: unknown,
      { input },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.elemento.create({ data: input });
    },
    addElementos: async (_, { instalacionId, elementos }, { session, prisma }) => {
      if (!session?.user?.id) throw new Error("No autenticado");

      await prisma.elemento.createMany({
        data: elementos.map(el => ({
          instalacionId,
          productoId: el.productoId,
          cantidad: el.cantidad
        })),
      });

      return prisma.elemento.findMany({
        where: { instalacionId },
        include: { producto: true }
      });
    },
    updateElemento: async (
      _parent: unknown,
      { id, input }: { id: string, input: ElementoInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.elemento.update({ where: { id }, data: input });
    },
    deleteElemento: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.elemento.delete({ where: { id } });
      return deleted !== null;
    },

    createProducto: async (
      _parent: unknown,
      { input },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.producto.create({ data: input });
    },
    updateProducto: async (
      _parent: unknown,
      { id, input }: { id: string, input: ProductoInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.producto.update({ where: { id }, data: input });
    },
    deleteProducto: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.producto.delete({ where: { id } }).catch(() => null);

      return deleted !== null; // Devuelve true si se eliminó, false si falló
    },
    createCategory: async (
      _parent: unknown,
      { input }: { input: { name: string; } },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.category.create({ data: input });
    },
    updateCategory: async (
      _parent: unknown,
      { id, name }: { id: string; name: string; },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.category.update({
        where: { id },
        data: { name },
      });
    },
    deleteCategory: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.category.delete({ where: { id } });
      return deleted !== null;
    },
    createSubcategory: async (
      _parent: unknown,
      { input }: { input: { name: string, categoriaId: string } },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.subcategory.create({ data: input });
    },
    updateSubcategory: async (
      _parent: unknown,
      { id, name }: { id: string; name: string; },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.subcategory.update({
        where: { id },
        data: { name },
      });
    },
    deleteSubcategory: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.subcategory.delete({ where: { id } });
      return deleted !== null;
    },
    createImage: async (
      _parent: unknown,
      { input }: { input: { url: string; } },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.image.create({ data: input });
    },
    updateImage: async (
      _parent: unknown,
      { id, url }: { id: string; url: string; },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.image.update({
        where: { id },
        data: { url },
      });
    },
    deleteImage: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.image.delete({ where: { id } });
      return deleted !== null;
    },
    addComment: async (_, { authorId, comunidadId, edificioId, comment, parentId },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.comment.create({
        data: { authorId, comunidadId, edificioId, comment, parentId }
      });
    },

    rateComment: async (_, { commentId, rating },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.comment.update({
        where: { id: commentId },
        data: { rating }
      });
    },

    addReaction: async (_, { commentId, type }, context: { session: Session }) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");

      const existingReaction = await prisma.reaction.findFirst({
        where: { commentId, userId: context.session.user.id }
      });

      if (existingReaction) {
        if (existingReaction.type === type) {
          await prisma.reaction.delete({ where: { id: existingReaction.id } });
          return null;
        } else {
          return prisma.reaction.update({
            where: { id: existingReaction.id },
            data: { type }
          });
        }
      } else {
        return prisma.reaction.create({
          data: { commentId, userId: context.session.user.id, type }
        });
      }
    },

    deleteComment: async (_, { id }, { prisma }) => {
      try {
        // 1. Eliminar reacciones asociadas
        await prisma.reaction.deleteMany({
          where: { commentId: id }
        });

        // 2. Eliminar respuestas (replies) asociadas
        await prisma.comment.deleteMany({
          where: { parentId: id }
        });

        // 3. Ahora sí, eliminar el comentario
        await prisma.comment.delete({
          where: { id }
        });

        return true;
      } catch (error) {
        console.error("Error al eliminar comentario:", error);
        throw new Error("No se pudo eliminar el comentario.");
      }
    },
    createContacto: async (
      _parent: unknown,
      { input }: { input: ContactoInput},
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.contacto.create({ data: input });
    },
    updateContacto: async (
      _parent: unknown,
      { id, input }: { id: string, input: ContactoInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.contacto.update({
        where: { id },
        data: input,
      });
    },
    deleteContacto: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.contacto.delete({ where: { id } });
      return deleted !== null;
    },
    deleteManual: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.manual.delete({ where: { id } });
      return deleted !== null;
    }
    ,
    updateManual: async (
      _parent: unknown,
      { id, input }: { id: string; input: ManualInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
    
      // Extraer las referencias de productos del input
      const { name, description, referencias } = input;
    
      // Encontrar los IDs de los productos correspondientes a las referencias
      const referenciasNumeros = referencias
        .match(/Ref:\s*(\d+)/gi)
        ?.map((match) => match.replace(/Ref:\s*/, "").trim()) || [];
    
      const productosExistentes = await prisma.producto.findMany({
        where: { ref: { in: referenciasNumeros } },
        select: { id: true },
      });
    
      const productoIds = productosExistentes.map((producto) => producto.id);
    
      // Actualizar el manual
      return prisma.manual.update({
        where: { id },
        data: {
          name,
          description,
          productos: {
            set: productoIds.map((id) => ({ id })), // Conectar los productos seleccionados
          },
        },
      });
    },
    createDocument: async (
      _parent: unknown,
      { url }: { url: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.document.create({ data: { url } });
    }
    ,
    updateDocument: async (
      _parent: unknown,
      { id, input}: { id: string; input: DocumentInput },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      return prisma.document.update({
        where: { id },
        data: input ,
      });
    },
    deleteDocument: async (
      _parent: unknown,
      { id }: { id: string },
      context: { session: Session }
    ) => {
      if (!context.session?.user?.id) throw new Error("No autenticado");
      const deleted = await prisma.document.delete({ where: { id } });
      return deleted !== null;
    }
    ,


    // ... (añadir más mutations según sea necesario)

  }
};