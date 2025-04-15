

export const typeDefs = `#graphql
scalar DateTime



type User {
  id: ID!
  name: String
  email: String!
  emailVerified: DateTime
  hasPassword: Boolean!
  image: String
  role: Rol
  company: Company
  accounts: [Account]
  comments: [Comment]
  reactions: [Reaction]
  userSubscriptions: [UserSubscription]
  createdAt: DateTime!
  lastLogin: DateTime
  isOnline: Boolean!
}

type Account {
  id: ID! 
  userId: String
  type: String
  provider: String
  providerAccountId: String
  refresh_token: String
  access_token: String
  expires_at: Int
  token_type: String
  scope: String
  id_token: String
  session_state: String
  user: User 
}

type Rol {
  id: ID!
  name: String!
  level: Int
  users: [User]
}

type Company {
  id: ID!
  name: String!
  cif: String!
  address: String!
  type: String!
  phone: String!
  users: [User!]!
  owner: User!
  companySubscriptions: [CompanySubscription]!
  comunidades: [Comunidad!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comunidad {
  id: ID!
  name: String!
  direccion: String!
  cp: String
  adminCompanyId: String
  adminCompany: Company
  instalaciones: [Instalacion]
  edificios: [Edificio!]!
  comments: [Comment]
  contactos: [Contacto]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Edificio {
  id: ID!
  name: String!
  label: String
  direccion:   String
  cp: String
  adminCompany:  Company
  adminCompanyId: String
  comunidadId: String
  comunidad: Comunidad
  comments: [Comment]
  instalaciones: [Instalacion]
  createdAt: DateTime!
  updatedAt: DateTime!
  contactos: [Contacto]
}

type Comment {
    id: ID!
    author: User!
    comunidad: Comunidad
    edificio: Edificio
    comment: String!
    rating: Float
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    parent: Comment
    replies: [Comment!]
    reactions: [Reaction!]
    averageRating: Float
  }

  type Reaction {
    id: ID!
    user: User!
    comment: Comment!
    type: String!
    createdAt: DateTime!
  }


type Instalacion {
  id: ID!
  tipo: String!
  descripcion: String!
  installerCompany: Company
  installerCompanyId: String
  edificio:   Edificio
  edificioId: String
  comunidad:  Comunidad
  comunidadId: String
  elementos: [Elemento!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  categoryId: String
  category: Category
}

type Elemento {
  id: ID!
  producto: Producto
  instalacion: Instalacion
  estado: String!
  cantidad: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Producto {
  id: ID!
  ref: String!
  ean: String
  name: String
  price: Float!
  descripcion: String!
  subcategory: Subcategory
  brand: Brand
  image: Image
  manuals: [Manual!]!
  elementos: [Elemento!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Subscription {
  id: ID!
  name: String!
  price: Int!
  duration: Int!
  isTrial: Boolean!
  isLifetime: Boolean!
  userSubscriptions: [UserSubscription]!
  companySubscriptions: [CompanySubscription]!
}

type UserSubscription {
  id: ID!
  user: User!
  subscription: Subscription!
  startDate: DateTime!
  endDate: DateTime!
  status: String!
  autoRenew: Boolean!
}

type CompanySubscription {
  id: ID!
  company: Company!
  subscription: Subscription!
  startDate: DateTime!
  endDate: DateTime!
  status: String!
  autoRenew: Boolean!
}

# Nuevos tipos


type Admin {
  id: ID!
  name: String!
  agente: Int
  comunidad: [Comunidad!]
  edificio: [Edificio!]
}

type Contacto {
  id: ID!                                   
  name: String 
  phone: String  
  location: String 
  edificio: Edificio
  comunidad: Comunidad                       
  type: String                   
}

type Aviso {
  id: ID!
}

type EdificioComment {
  id: ID!
}

type Category {
  id: ID!
  name: String!
  instalaciones: [Instalacion]
  subcategorias: [Subcategory]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Subcategory {
  id: ID!
  name: String!
  categoria: Category
  categoriaId: String
  productos: [Producto!]!
}

type Brand {
  id: ID!
  name: String!
  productos: [Producto!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Image {
  id: ID!
  url: String!
  producto: Producto!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Document {
  id: ID!
  url: String!
  manuals: [Manual!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Manual {
  id: ID!
  documento: Document
  productos: [Producto!]!
  name: String!
  description: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserNotification {
  id: ID!
  title: String!
  body: String!
  link: String
  read: Boolean!
  createdAt: DateTime!
  user: User!
}

type Notification {
  id: ID!
  message: String!
  userId: String!
  createdAt: String!
}

type Subscription {
  notificationReceived(userId: ID!): Notification
}


# ... Añadir más tipos según sea necesario

type Query {
  me: User
  myNotifications: [UserNotification!]!
  listUsers: [User!]!
  countUsers: Int!
  getUser(id: ID!): User
  listRoles: [Rol!]!
  countRoles: Int!
  getRole(id: ID!): Rol
  listSubscriptions: [Subscription!]!
  countSubscriptions: Int!
  subscription(id: ID!): Subscription
  userSubscriptions(userId: ID!): [UserSubscription!]!
  companySubscriptions(companyId: ID!): [CompanySubscription!]!
  accounts: [Account!]!
  getCompany(id: ID!): Company
  listCompanies: [Company!]!
  countCompanies: Int!
  getComunidad(id: ID!): Comunidad
  listComunidades: [Comunidad!]!
  countComunidades: Int!
  getEdificio(id: ID!): Edificio
  listEdificios: [Edificio!]!
  countEdificios: Int!
  getInstalacion(id: ID!): Instalacion
  listInstalaciones: [Instalacion!]!
  countInstalaciones: Int!
  getElemento(id: ID!): Elemento
  listElementos: [Elemento!]!
  getProducto(id: ID!): Producto
  listProductos(searchTerm: String, page: Int!, pageSize: Int!, categoryId: ID, brandId: ID): ProductosResponse!
  countProductos: Int!
  getBrand(id: ID!): Brand
  listBrands: [Brand!]!
  countBrands: Int!
  getManual(id: ID!): Manual
  listManuals(searchTerm: String, page: Int!, pageSize: Int!): ManualsResponse!
  countManuals: Int!
  getDocument(id: ID!): Document
  listDocuments: [Document!]!
  countDocuments: Int!
  getImage(id: ID!): Image
  listImages: [Image!]!
  countImages: Int!
  getCategory(id: ID!): Category
  listCategories: [Category!]!
  countCategories: Int!
  getSubcategory(id: ID!): Subcategory
  listSubcategories: [Subcategory!]!
  getComments(comunidadId: ID, edificioId: ID): [Comment!]
  listContactos: [Contacto!]!
  countContactos: Int!
}

type Mutation {

  # Operaciones CRUD para Auth
  login(email: String!, password: String!): LoginResponse!
  loginWithGoogle(token: String!): LoginResponse!
  logout: Boolean!
  register(name: String!, email: String!, password: String!): User!
  
  
  addComment(input: CommentInput!): Comment!
  rateComment(commentId: ID!, rating: Int!): Comment!
  addReaction(input: ReactionInput!): Reaction!
  deleteComment(id: ID!): Boolean!
  importManuales(data: [ManualInput!]!): ImportResponse!
  importProducts(data: [ProductoInput!]!): ImportResponse!
  # Operaciones CRUD para User
  createUser(name: String, email: String!, password: String): User!
  updateUser(id: ID!, name: String, email: String, roleId: ID): User!
  deleteUser(id: ID!): Boolean!
  changePassword(id: ID!, password: String!):  User!
  checkPassword(id: ID!, password: String!): Boolean!
  markNotificationAsRead(id: ID!): UserNotification
  markAllNotificationsAsRead: Boolean
  createUserNotification(userId: ID!,title: String!,body: String!,link: String): UserNotification!

  # Operaciones CRUD para Rol
  createRole(name: String!, level: Int): Rol!
  updateRole(id: ID!, name: String!, level: Int): Rol!
  deleteRole(id: ID!): Boolean!

  # Operaciones CRUD para Category
  createCategory(input: CategoryInput!): Category!
  updateCategory(id: ID!, name: String!): Category!
  deleteCategory(id: ID!): Boolean!

   # Operaciones CRUD para Subcategory
  createSubcategory(input: SubcategoryInput!): Subcategory!
  updateSubcategory(id: ID!, name: String!): Subcategory!
  deleteSubcategory(id: ID!): Boolean!

# Operaciones CRUD para Image
  createImage(input: ImageInput!): Image!
  updateImage(id: ID!, url: String!): Image!
  deleteImage(id: ID!): Boolean!

  # Operaciones CRUD para Brand
  createBrand(input: BrandInput!): Brand!
  updateBrand(id: ID!, name: String!): Brand!
  deleteBrand(id: ID!): Boolean!

  # Operaciones CRUD para Company
  createCompany(input: CompanyInput!): Company!
  updateCompany(id: ID!, input: CompanyInput!): Company!
  deleteCompany(id: ID!): Boolean!
  removeUserFromCompany(userId: ID!, companyId: ID!): Company!
  addUserToCompany(userId: ID!, companyId: ID!): Company!
  addCommunityToCompany(companyId: ID!, comunidadId: ID!): Company!
  removeCommunityFromCompany(companyId: ID!, comunidadId: ID!): Company!

  createComunidad(input: ComunidadInput!): Comunidad!
  updateComunidad(id: ID!, input: ComunidadInput!): Comunidad!
  deleteComunidad(id: ID!): Boolean!

  createEdificio(input: EdificioInput!): Edificio!
  updateEdificio(id: ID!, input: EdificioInput!): Edificio!
  deleteEdificio(id: ID!): Boolean!

  createInstalacion(input: InstalacionInput!): Instalacion!
  updateInstalacion(id: ID!, input: InstalacionInput!): Instalacion!
  deleteInstalacion(id: ID!): Boolean!

  createElemento(input: ElementoInput!): Elemento!
  updateElemento(id: ID!, input: ElementoInput!): Elemento!
  deleteElemento(id: ID!): Boolean!
  addElementos(instalacionId: ID!, elementos: [ElementoInput!]!): [Elemento!]!

  createProducto(input: ProductoInput!): Producto!
  updateProducto(id: ID!, input: ProductoInput!): Producto!
  deleteProducto(id: ID!): Boolean!

  # Operaciones CRUD para Subscription
  createSubscription(name: String!, price: Int!, duration: Int!, isTrial: Boolean!, isLifetime: Boolean!): Subscription!
  updateSubscription(id: ID!, name: String, price: Int, duration: Int, isTrial: Boolean, isLifetime: Boolean): Subscription!
  deleteSubscription(id: ID!): Boolean!

  # Operaciones CRUD para UserSubscription
  createUserSubscription(userId: ID!, subscriptionId: ID!, startDate: DateTime!, endDate: DateTime!, status: String!, autoRenew: Boolean!): UserSubscription!
  updateUserSubscription(id: ID!, status: String, autoRenew: Boolean, endDate: DateTime): UserSubscription!
  deleteUserSubscription(id: ID!): Boolean!

  # Operaciones CRUD para CompanySubscription
  createCompanySubscription(companyId: ID!, subscriptionId: ID!, startDate: DateTime!, endDate: DateTime!, status: String!, autoRenew: Boolean!): CompanySubscription!
  updateCompanySubscription(id: ID!, status: String, autoRenew: Boolean, endDate: DateTime): CompanySubscription!
  deleteCompanySubscription(id: ID!): Boolean!

  # Operaciones CRUD para Manual
  createManual(input: ManualInput!): ImportResponseManual!
  updateManual(id: ID!, input: ManualUpdateInput!): Manual!
  deleteManual(id: ID!): Boolean!

  # Operaciones CRUD para Document
  createDocument(input: DocumentInput!): Document!
  updateDocument(id: ID!, input: DocumentInput!): Document!
  deleteDocument(id: ID!): Boolean!

  createContacto(input: ContactoInput!): Contacto!
  updateContacto(id: ID!, input: ContactoInput!): Contacto!
  deleteContacto(id: ID!): Boolean!

}

input CategoryInput {
  name: String!
}

input SubcategoryInput {
  name: String!
  categoriaId: String
}

input ImageInput {
  url: String!
}

input BrandInput {
  name: String!
}

input CompanyInput {
  name: String!
  cif: String!
  address: String!
  phone: String!
  type: String!
}

input ComunidadInput {
  name: String!
  direccion: String!
  cp: String
  adminCompanyId: String
}

input EdificioInput {
  name: String!
  comunidadId: String
  direccion: String
  cp: String
  adminCompanyId: String
}

input InstalacionInput {
  tipo: String!
  descripcion: String!
  edificioId: String
  categoryId: String
  comunidadId: String
}

input ElementoInput {
  productoId: String
  instalacionId: String
  estado: String
  cantidad: Int
}

input ProductoInput {
  ref: String!
  descripcion: String!
  ean: String
  price: Float!
  brandId: String
  subcategoryId: String
  imageId: String
}

type ImportResponse {
  success: Boolean!
  message: String!
}

type LoginResponse {
  user: User
  token: String
  success: Boolean!
  message: String!
}

type ImportResponseManual {
  success: Boolean!
  message: String!
  manual: Manual
}

input ManualInput {
  name: String!
  url: String!
  description: String
  productos: [ProductoInputManual!]!
}

input ProductoInputManual {
  id: String!
}
input ManualUpdateInput {
  name: String!
  description: String
  productos: [ProductoInputManual!]!
}

input DocumentInput {
  url: String!
}

type ProductosResponse {
  productos: [Producto!]!
  totalCount: Int!
}

type ManualsResponse {
  manuals: [Manual!]!
  totalCount: Int!
}

input ContactoInput {
  name: String!
  type: String
  location: String
  phone: String
  comunidadId: String
  edificioId: String
}

input CommentInput {
    comunidadId: String
    edificioId: String
    comment: String
    parentId: String
}
input ReactionInput {
      commentId: String
      type: String
    }

input UserNotificationCreateInput {
  userId: String
  title: String
  body: String
  link: String
}
`;
