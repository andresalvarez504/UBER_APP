<div align="center">

# 🚗 UberClone
### Aplicación Móvil de Transporte

**React Native · Firebase · Redux · Google Maps**

[![React Native](https://img.shields.io/badge/React_Native-0.85.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-latest-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![License](https://img.shields.io/badge/Licencia-Académica-green?style=flat-square)](./LICENSE)

</div>

---

## 👋 Bienvenido

**UberClone** es una aplicación móvil multiplataforma (iOS y Android) inspirada en Uber, desarrollada como proyecto final para la asignatura de **Desarrollo Móvil** en el Tecnológico de Antioquia.

La app integra un ecosistema completo de tecnologías modernas para ofrecer una experiencia de movilidad fluida y en tiempo real, con autenticación, gestión de viajes, historial de trayectos y selección de vehículos.

---

## ✨ Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | Registro e inicio de sesión con Firebase Auth |
| 👤 **Perfil de usuario** | Gestión de datos personales con validaciones completas |
| 🗺️ **Solicitud de viaje** | Búsqueda de origen/destino con selección de vehículo |
| 🚘 **Tipos de vehículo** | Económico, XL y Premium con tarifas dinámicas |
| 📋 **Historial de viajes** | Registro de trayectos con costo y detalles |
| 💳 **Pagos** | Integración con Stripe y MercadoPago |
| 🌐 **Multilenguaje** | Soporte para Español e Inglés |

---

## 🛠️ Tecnologías utilizadas

```
React Native CLI     → Interfaz de usuario multiplataforma (iOS & Android)
Firebase Firestore   → Base de datos NoSQL en tiempo real
Firebase Auth        → Autenticación de usuarios
Redux Toolkit        → Estado global de la aplicación
React Navigation     → Navegación Stack + Tab entre pantallas
Google Maps API      → Visualización de mapas y rutas
Google Places API    → Autocompletado de destinos
Google Directions    → Cálculo de rutas óptimas
Google Distance Matrix → Estimación de tiempo y distancia
```

---

## 📁 Estructura del proyecto

```
MovilUberApp/
├── src/
│   ├── components/
│   │   └── CustomButton.js          # Botón reutilizable
│   ├── navigation/
│   │   └── AppNavigator.js          # Stack + Tab navigator
│   ├── redux/
│   │   ├── store.js                 # Configuración del store
│   │   └── slices/
│   │       └── userSlice.js         # Estado global del usuario
│   ├── screens/
│   │   ├── LoginScreen.js           # Inicio de sesión
│   │   ├── CreateUserScreen.js      # Registro de usuario
│   │   ├── HomeScreen.js            # Pantalla principal + historial
│   │   ├── ServiceUberScreen.js     # Solicitud de viaje
│   │   ├── ConfigUserScreen.js      # Perfil y configuración
│   │   └── ChangePasswordScreen.js  # Cambio de contraseña
│   └── storage/
│       ├── Firebase.config.js       # Configuración de Firebase
│       └── Firestore.Service.js     # Servicios de base de datos
├── App.tsx                          # Punto de entrada principal
├── package.json
└── README.md
```

---

## 🗄️ Colecciones en Firestore

```
users/
  └── {userId}
        ├── uid, fullName, email, phone
        ├── gender, language, photoURL, role
        └── tripHistory/ (subcolección)
              └── {tripId} → fare, origin, destination, date

trips/
  └── {tripId}
        ├── passengerId, vehicleTypeId
        ├── originName, destName
        ├── distanceKm, durationMin, fare
        └── status, paymentMethod, createdAt

vehicleTypes/
  └── economy | xl | premium
        └── name, description, baseFare, perKm, capacity

payments/
  └── {paymentId}
        └── tripId, passengerId, amount, method, status
```

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/MovilUberApp.git
cd MovilUberApp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Firestore** y **Authentication** (email/password)
3. Reemplaza las credenciales en `src/storage/Firebase.config.js`

### 4. Configurar Google Maps

Añade tu API Key en:
- **Android**: `android/app/src/main/AndroidManifest.xml`
- **iOS**: `ios/MovilUberApp/AppDelegate.swift`

### 5. Correr la aplicación

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## 📸 Pantallas

| Login | Registro | Home |
|-------|----------|------|
| Inicio de sesión con validación de email y contraseña | Formulario completo con campos validados | Dashboard con historial de viajes |

| Solicitar viaje | Perfil | Cambiar contraseña |
|-----------------|--------|-------------------|
| Selección de origen, destino y tipo de vehículo | Edición de datos personales | Reautenticación segura |

---

## ✅ Buenas prácticas aplicadas

- ✔️ Código en **inglés** (variables, funciones, comentarios)
- ✔️ Uso de **hooks** de React (`useState`, `useEffect`, `useSelector`, `useDispatch`)
- ✔️ **Validaciones** en todos los formularios (nulos, formato, longitud)
- ✔️ Base de datos **no relacional** (Firestore)
- ✔️ **Modularización** en componentes reutilizables
- ✔️ **Redux** para estado global
- ✔️ **React Navigation** con Stack y Tab navigator
- ✔️ Ramas Git por integrante + merge a `main`
- ✔️ Commits descriptivos y Pull Requests revisados

---

## 👥 Integrantes

| Nombre | Rol | Rama Git |
|--------|-----|----------|
| Andrés Ferandez | Estudiante | `feature/andres` |
| Saray Lopez| Estudiante |`feature/Saray` |

---

## 📄 Información académica

| Campo | Detalle |
|-------|---------|
| **Institución** | Tecnológico de Antioquia |
| **Programa** | Ingeniería en Software |
| **Asignatura** | Desarrollo Móvil |
| **Docente** | Paula Andrea Muñoz Correa |
| **Semestre** | 2026-1 |

---

<div align="center">

Hecho con ❤️ en Medellín, Colombia 🇨🇴

</div>
