import { gql } from "@apollo/client";

// Consulta para obtener usuarios
export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      emailVerified
      lastLogin
      createdAt
      hasPassword
      role {
        id
        name
      }
      accounts {
        provider
        id
      }
      company {
        id
        name
        cif
        phone
        address
        type
        createdAt
        updatedAt
        users {
          id
          name
          lastLogin
        }
        owner{
          id
          name
          lastLogin
        }
      }
      userSubscriptions {
        id
        endDate
        status
        subscription {
          name
        }
      }
      image
    }
  }
`;
export const GET_USERS = gql`
  query GetUsers {
    listUsers {
      id
      name
      image
      hasPassword
      email
      emailVerified
      lastLogin
      createdAt
      role {
        id
        name
      }
      accounts {
        id
        provider
      }
      userSubscriptions {
        id
        endDate
        status
        subscription {
          name
        }
      }
    }
  }
`;

// Mutación para actualizar usuario
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $roleId: ID) {
    updateUser(id: $id, name: $name, email: $email, roleId: $roleId) {
      id
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
      lastLogin
      role {
        name
      }
    }
  }
`;

// Mutación para eliminar usuario
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation changePassword($password: String!, $id: ID!) {
  changePassword(password: $password, id: $id) {
    id
  }
}
`

export const REMOVE_USER_FROM_COMPANY = gql`
  mutation RemoveUserFromCompany($userId: ID!, $companyId: ID!) {
  removeUserFromCompany(userId: $userId, companyId: $companyId) {
  id
  users {
      id
      name
    }
  }
}
`;

export const CHECK_PASSWORD = gql`
  mutation CheckPassword($password: String!, $id: ID!) {
  checkPassword(password: $password, id: $id)
}
`

// Consulta para obtener roles
export const GET_ROLES = gql`
  query GetRoles {
    listRoles {
      id
      name
      level
      users {
        id
        name
        image
      }
    }
  }
`;

// Mutación para actualizar rol
export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $name: String!, $level: Int) {
    updateRole(id: $id, name: $name, level: $level) {
      id
      name
      level
      users {
        name
      }
    }
  }
`;

// Mutación para eliminar rol
export const DELETE_ROLE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($name: String!, $level: Int) {
  createRole(name: $name, level: $level) {
    id
    level
    name
    users {
      id
    }
  }
}
`

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
  subscriptions {
    price
    name
    isTrial
    isLifetime
    id
    duration
    userSubscriptions {
      status
      user {
        id
        name
        image
      }
    }
    companySubscriptions {
      status
      company {
        id
        name
      }
    }
  }
}
`
export const DELETE_SUBSCRIPTION = gql`
mutation DeleteSubscription($id: ID!) {
    deleteSubscription(id: $id)
  }
`

export const CREATE_SUBSCRIPTION = gql`
mutation CreateUserSubscription($name: String!, $price: Int!, $duration: Int!, $isTrial: Boolean!, $isLifetime: Boolean!) {
  createSubscription(name: $name, price: $price, duration: $duration, isTrial: $isTrial, isLifetime: $isLifetime) {
    duration
    id
    isLifetime
    isTrial
    name
    price
  }
}
`

export const UPDATE_SUBSCRIPTION = gql`
mutation UpdateSubscription($id: ID!, $name: String, $price: Int, $duration: Int, $isTrial: Boolean, $isLifetime: Boolean) {
  updateSubscription(id: $id, name: $name, price: $price, duration: $duration, isTrial: $isTrial, isLifetime: $isLifetime) {
    duration
    id
    isLifetime
    isTrial
    name
    price
  }
}
`

export const GET_PRODUCTS = gql`
query GetProductos($searchTerm: String, $page: Int!, $pageSize: Int!, $categoryId: ID) {
  listProductos(searchTerm: $searchTerm, page: $page, pageSize: $pageSize, categoryId: $categoryId) {
  productos {
    id
    name
    descripcion
    createdAt
    ean
    image {
      id
      url
    }
    brand {
      id
      name
    }
    subcategory {
      id
      name
      categoria {
        id
        name
      }
    }
    manuals {
      id
      description
      name
      documento {
        id
        url
      }
    }
    price
    ref
    updatedAt
  }
  totalCount
  }
}`

export const CREATE_PRODUCTO = gql`
mutation Mutation($input: ProductoInput!) {
  createProducto(input: $input) {
    id
    descripcion
    createdAt
    ean
    price
    ref
    updatedAt
  }
}
`
export const UPDATE_PRODUCTO = gql`
mutation Mutation($id: ID!, $input: ProductoInput!) {
  updateProducto(id: $id, input: $input) {
    id
    descripcion
    createdAt
    ean
    price
    ref
    updatedAt
  }
}
`

export const DELETE_PRODUCTO = gql`
mutation Mutation($id: ID!) {
  deleteProducto(id: $id)
}
`

export const IMPORT_PRODUCTS = gql`
mutation ImportProducts($data: [ProductoInput!]!) {
  importProducts(data: $data) {
    success
    message
  }
}
`;

export const IMPORT_MANUALS = gql`
  mutation ImportManuales($data: [ManualInput!]!) {
    importManuales(data: $data) {
      success
      message
    }
  }
`;

export const CREATE_MANUAL = gql`
mutation Mutation($input: ManualInput!) {
  createManual(input: $input) {
    id
    descripcion
    name
    document {
      id
      url
    }
  }
}
`
export const UPDATE_MANUAL = gql`
mutation Mutation($id: ID!, $input: ManualInput!) {
  updateManual(id: $id, input: $input) {
    id
    descripcion
    name
    document {
      id
      url
    }
  }
}
`
export const DELETE_MANUAL = gql`
mutation Mutation($id: ID!) {
  deleteManual(id: $id)
}
`

export const GET_CATEGORIES = gql`
query Query {
  listCategories {
    id
    name
    instalaciones {
      id
    }
    subcategorias {
      id
      name
      productos {
        id
      }
    }
  }
}
`

export const GET_SUBCATEGORIES = gql`
query Query {
  listSubcategories {
    id
    name
    categoria {
      id
      name
    }
  }
}

`
export const CREATE_CATEGORY = gql`
mutation Mutation($input: CategoryInput!) {
  createCategory(input: $input) {
    id
    name
  }
}
`

export const CREATE_SUBCATEGORY = gql`
mutation Mutation($input: SubcategoryInput!) {
  createSubcategory(input: $input) {
    id
    name
  }
}
`
export const UPDATE_CATEGORY = gql`
mutation Mutation($id: ID!, $name: String!) {
  updateCategory(id: $id, name: $name) {
    id
    name
  }
}
`
export const DELETE_CATEGORY = gql`
mutation Mutation($id: ID!) {
  deleteCategory(id: $id)
}
`

export const UPDATE_SUBCATEGORY = gql`
mutation Mutation($id: ID!, $name: String!) {
  updateSubcategory(id: $id, name: $name) {
    id
    name
  }
}
`
export const DELETE_SUBCATEGORY = gql`
mutation Mutation($id: ID!) {
  deleteSubcategory(id: $id)
}
`
export const GET_IMAGES = gql`
query Query {
  listImages {
    id
    url
  }
}
`
export const CREATE_IMAGE = gql`
mutation Mutation($input: ImageInput!) {
  createImage(input: $input) {
    id
    url
  }
}
`
export const UPDATE_IMAGE = gql`
mutation Mutation($id: ID!, $url: String!) {
  updateImage(id: $id, url: $url) {
    id
    url
  }
}
`
export const DELETE_IMAGE = gql`
mutation Mutation($id: ID!) {
  deleteImage(id: $id)
}
`
export const GET_MANUALS = gql`
query Query {
  listManuals {
    id
    description
    name
    documento {
      id
      url
    }
    productos {
      id
      ref
    }
  }
}
`

export const GET_BRANDS = gql` 
query Query {
  listBrands {
    id
    name
    productos {
      id
    }
  }
}
`
export const CREATE_BRAND = gql`
mutation Mutation($input: BrandInput!) {
  createBrand(input: $input) {
    id
    name
  }
}
`
export const UPDATE_BRAND = gql`
mutation Mutation($id: ID!, $name: String!) {
  updateBrand(id: $id, input: $input) {
    id
    name
  }
}
`
export const DELETE_BRAND = gql`
mutation Mutation($id: ID!) {
  deleteBrand(id: $id)
}
`

export const GET_COMPANIES = gql`
query ListCompanies {
  listCompanies {
    id
    name
    cif
    phone
    address
    type
    createdAt
    updatedAt
    users {
      id
      name
    }
    comunidades {
      id
      name
    }
    companySubscriptions {
      id
      status
      endDate
      subscription {
        name
      }
    }
  }
}
`
export const CREATE_COMPANY = gql`
mutation Mutation($input: CompanyInput!) {
  createCompany(input: $input) {
    id
    name
  }
}
`
export const UPDATE_COMPANY = gql`
mutation Mutation($id: ID!, $input: CompanyInput!) {
  updateCompany(id: $id, input: $input) {
    id
    name
  }
}
`
export const DELETE_COMPANY = gql`
mutation Mutation($id: ID!) {
  deleteCompany(id: $id)
}
`

export const GET_DOCUMENTS = gql`
query Query {
  listDocuments {
    id
    url
    manuals {
      id
      name
    }
  }
}
`
export const CREATE_DOCUMENT = gql`
mutation Mutation($input: DocumentInput!) {
  createDocument(input: $input) {
    id
    url
  }
}
`
export const UPDATE_DOCUMENT = gql`
mutation Mutation($id: ID!, $name: String!) {
  updateDocument(id: $id, input: $input) {
    id
    url
  }
}
`
export const DELETE_DOCUMENT = gql`
mutation Mutation($id: ID!) {
  deleteDocument(id: $id)
}
`

export const GET_COMUNIDADES = gql`
query ListComunidades {
  listComunidades {
    id
    name
    direccion
    cp
    adminCompany {
      id
      name
    }
    edificios {
      id
      name
      adminCompany {
        id
        name
      }
    }
  }
}
`
export const CREATE_COMUNIDAD = gql`
mutation Mutation($input: ComunidadInput!) {
  createComunidad(input: $input) {
    id
    name
  }
}
`
export const UPDATE_COMUNIDAD = gql`
mutation Mutation($id: ID!, $input: ComunidadInput!) {
  updateComunidad(id: $id, input: $input) {
    id
    name
  }
}
`
export const DELETE_COMUNIDAD = gql`
mutation Mutation($id: ID!) {
  deleteComunidad(id: $id)
}
`

export const GET_EDIFICIOS = gql`
query ListEdificios {
  listEdificios {
    id
    name
    direccion
    cp
    comunidad {
      id
      name
    }
    instalaciones {
      id
      tipo
    }
    adminCompany {
      id
      name
    }
  }
}
`
export const CREATE_EDIFICIO = gql`
mutation Mutation($input: EdificioInput!) {
  createEdificio(input: $input) {
    id
    name
  }
}
`
export const UPDATE_EDIFICIO = gql`
mutation Mutation($id: ID!, $input: EdificioInput!) {
  updateEdificio(id: $id, input: $input) {
    id
    name
  }
}
`
export const DELETE_EDIFICIO = gql`
mutation Mutation($id: ID!) {
  deleteEdificio(id: $id)
}
`

export const GET_INSTALACIONES = gql`
query Query {
  listInstalaciones {
    id
    tipo
    descripcion
    comunidad {
      id
      name
      direccion
      cp
    }
    edificio {
      id
      name
      direccion
      cp
      comunidad {
        id
        name
        direccion
        cp
      }
    }
    installerCompany {
      id
      name
    }
    elementos {
      id
      estado
      producto {
        id
        ref
      }
    }
  }
}
`
export const CREATE_INSTALACION = gql`
mutation CreateInstalacion($input: InstalacionInput!) {
  createInstalacion(input: $input) {
    id
    tipo
    descripcion
  }
}
`
export const UPDATE_INSTALACION = gql`
mutation Mutation($id: ID!, $input: InstalacionInput!) {
  updateInstalacion(id: $id, input: $input) {
    id
    tipo
  }
}
`
export const DELETE_INSTALACION = gql`
mutation Mutation($id: ID!) {
  deleteInstalacion(id: $id)
}
`

export const GET_COMUNIDAD = gql`
query GetComunidad($id: ID!) {
  getComunidad(id: $id) {
    direccion
    createdAt
    cp
    name
    contactos {
      id
      name
      phone
      location
      type
      comunidad {
        name
      }
    }
    comments {
      id
      replies {
        id
        comment
        createdAt
        author {
          id
          name
          image
        }
      }
      author {
        id
        name
        image
      }
      reactions {
        id
        type
      }
      comment
      createdAt
    }
    adminCompany {
      id
      name
    }
    edificios {
      id
      name
      instalaciones {
        id
        tipo
        category {
          id
          name
        }
        elementos {
          id
          cantidad
          producto {
            name
            ref
            image {
              url
            }
            brand {
             id
              name
            }
             subcategory {
             id
             name
              categoria {
                id
               name
             }
            }
          }
        }
      }
    }
    instalaciones {
      id
      tipo
      categoryId
      category {
          id
          name
        }
      elementos {
        id
        cantidad
        producto {
          name
          ref
          image {
            url
          }
          descripcion
          manuals {
            id
            name
            documento {
              url
            }
          }
          brand {
            id
            name
           }
           subcategory {
             id
             name
              categoria {
                id
               name
             }
            }
        }
      }
    }
    id
    name
  }
}
`
export const GET_EDIFICIO = gql`
query GetEdificio($id: ID!) {
  getEdificio(id: $id) {
    id
    name
    direccion
    cp
    createdAt
    contactos {
      id
      name
      phone
      location
      type
      edificio {
        name
        comunidad {
          name
        }
      }
    }
    comunidad {
      id
      name
      direccion
      cp
    }
    comments {
      id
      replies {
        id
        comment
        createdAt
        author {
          id
          name
          image
        }
      }
      author {
        id
        name
        image
      }
      reactions {
        id
        type
      }
      comment
      createdAt
    }
    adminCompany {
      id
      name
    }
    instalaciones {
      id
      tipo
      categoryId
      category {
          id
          name
        }
      
      elementos {
        id
        cantidad
        producto {
          name
          ref
          image {
            url
          }
          descripcion
          manuals {
            id
            name
            documento {
              url
            }
          }
          subcategory {
             id
             name
              categoria {
                id
               name
             }
          }
          brand {
            id
            name
           }
        }
      }
    }
  }
}
`

export const ADD_REACTION = gql`
  mutation AddReaction($commentId: ID!, $type: String!) {
    addReaction(commentId: $commentId, type: $type) {
      id
      type
    }
  }
`;

export const POST_COMMENT = gql`
  mutation Mutation($authorId: ID!, $comment: String!, $comunidadId: ID, $edificioId: ID) {
  addComment(authorId: $authorId, comment: $comment, comunidadId: $comunidadId, edificioId: $edificioId) {
    id
    comment
  }
}
`

export const REPLY_COMMENT = gql`
  mutation Mutation($authorId: ID!, $comment: String!, $parentId: ID, $comunidadId: ID) {
  addComment(authorId: $authorId, comment: $comment, parentId: $parentId, comunidadId: $comunidadId) {
    id
    comment
  }
}
`
export const DELETE_COMMENT = gql`
  mutation Mutation($id: ID!) {
  deleteComment(id: $id)
}
`

export const ADD_ELEMENTOS = gql`
  mutation AddElementos($instalacionId: ID!, $elementos: [ElementoInput!]!) {
  addElementos(instalacionId: $instalacionId, elementos: $elementos) {
    id
    cantidad
    producto {
      id
      name
    }
  }
}`

export const DELETE_ELEMENTO = gql`
  mutation DeleteElemento($id: ID!) {
    deleteElemento(id: $id)
  }`

export const UPDATE_ELEMENTO = gql`
  mutation UpdateElemento($updateElementoId: ID!, $input: ElementoInput!) {
  updateElemento(id: $updateElementoId, input: $input) {
    id
    cantidad
  }
}`

export const CREATE_CONTACTO = gql`
mutation CreateContacto($input: ContactoInput!) {
  createContacto(input: $input) {
    id
    name
  }
}`

export const DELETE_CONTACTO = gql`
mutation DeleteContacto($id: ID!) {
  deleteContacto(id: $id)
}`

export const COUNT_DATA = gql`
query Query {
  countUsers,
  countRoles
  countSubscriptions
  countProductos
  countManuals
  countImages
  countEdificios
  countDocuments
  countComunidades
  countCompanies
  countCategories
  countBrands
  countInstalaciones
}`

export const ADD_USER_TO_COMPANY = gql`
mutation AddUserToCompany($companyId: ID!, $userId: ID!) {
  addUserToCompany(companyId: $companyId, userId: $userId) {
    id
    users {
      id
      name
    }
  }
}`


export const ADD_COMMUNITY_TO_COMPANY = gql`
mutation AddCommunityToCompany($companyId: ID!, $comunidadId: ID!) {
  addCommunityToCompany(companyId: $companyId, comunidadId: $comunidadId) {
    id
    comunidades {
      id
      name
    }
  }
}`

export const REMOVE_COMMUNITY_FROM_COMPANY = gql`
mutation RemoveCommunityFromCompany($companyId: ID!, $comunidadId: ID!) {
  removeCommunityFromCompany(companyId: $companyId, comunidadId: $comunidadId) {
    id
    comunidades {
      id
      name
    }
  }
}
`

export const GET_CONTACTOS = gql`
query ListContactos {
  listContactos {
    id
    location
    name
    phone
    type
    edificio {
      id
      name
      label
    }
    comunidad {
      id
      name
    }
  }
}
`
export const UPDATE_CONTACTO = gql`
mutation Mutation($id: ID!, $input: ContactoInput!) {
  updateContacto(id: $id, input: $input) {
    id
  }
}
`