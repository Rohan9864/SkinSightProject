// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>

//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               borderRadius: '8px',
//               fontSize: '14px',
//             },
//           }}
//         />

//         {/* TEST UI (temporary) */}
//         <div className="min-h-screen bg-blue-600 flex items-center justify-center">
//           <h1 className="text-white text-4xl font-bold">
//             SkinSight ✅
//           </h1>
//         </div>

//         <Routes>
//           {/* Public */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />

//           {/* Patient */}
//           <Route path="/patient" element={
//             <ProtectedRoute allowedRoles={['PATIENT']}>
//               <PatientDashboard />
//             </ProtectedRoute>
//           } />

//           <Route path="/patient/submit" element={
//             <ProtectedRoute allowedRoles={['PATIENT']}>
//               <SubmitCasePage />
//             </ProtectedRoute>
//           } />

//           <Route path="/patient/cases/:id" element={
//             <ProtectedRoute allowedRoles={['PATIENT']}>
//               <CaseDetailPage />
//             </ProtectedRoute>
//           } />

//           {/* Doctor */}
//           <Route path="/doctor" element={
//             <ProtectedRoute allowedRoles={['DOCTOR']}>
//               <DoctorDashboard />
//             </ProtectedRoute>
//           } />

//           <Route path="/doctor/cases/:id" element={
//             <ProtectedRoute allowedRoles={['DOCTOR']}>
//               <ReviewCasePage />
//             </ProtectedRoute>
//           } />

//           {/* Admin */}
//           <Route path="/admin" element={
//             <ProtectedRoute allowedRoles={['ADMIN']}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           } />

//           <Route path="/admin/users" element={
//             <ProtectedRoute allowedRoles={['ADMIN']}>
//               <ManageUsersPage />
//             </ProtectedRoute>
//           } />

//           <Route path="/admin/cases/:id" element={
//             <ProtectedRoute allowedRoles={['ADMIN']}>
//               <AssignCasePage />
//             </ProtectedRoute>
//           } />

//           {/* Fallback */}
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>

//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

export default function App() {
  return (
    <div className="min-h-screen bg-blue-600
                    flex items-center
                    justify-center">
      <h1 className="text-white text-4xl
                     font-bold">
        SkinSight ✅
      </h1>
    </div>
  )
}