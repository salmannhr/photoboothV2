import { useEffect, useRef, useState } from 'react'
import Start from './pages/Start/Start.jsx'
import EmailCode from './pages/EmailCode/EmailCode.jsx'
import Capture from './pages/Capture/Capture.jsx'
import FrameSelect from './pages/FrameSelect/FrameSelect.jsx'
import Success from './pages/Success/Success.jsx'
import RoleSelect from './pages/staff/RoleSelect/RoleSelect.jsx'
import StaffLogin from './pages/staff/StaffLogin/StaffLogin.jsx'
import AdminDashboard from './pages/staff/AdminDashboard/AdminDashboard.jsx'
import OperatorDashboard from './pages/staff/OperatorDashboard/OperatorDashboard.jsx'

const SESSION_SECONDS = 6 * 60 // 6 menit, dari mulai capture sampai klik Next di FrameSelect

export default function App() {
  const [screen, setScreen] = useState('start')
  const [email, setEmail] = useState('')
  const [shots, setShots] = useState(null)

  const [intendedRole, setIntendedRole] = useState(null)
  const [staff, setStaff] = useState(null) // { token, role, username }

  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)
  const timerRef = useRef(null)

  // Timer jalan cuma pas di halaman capture/frame. Habis waktu -> balik ke
  // capture dengan waktu 6 menit lagi (sesi dianggap gagal, ulang dari nol).
  useEffect(() => {
    const timedScreens = screen === 'capture' || screen === 'frame'
    if (!timedScreens) {
      clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setShots(null)
          setScreen('capture')
          return SESSION_SECONDS
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen])

  function resetCustomerFlow() {
    setEmail('')
    setShots(null)
    setSecondsLeft(SESSION_SECONDS)
    setScreen('start')
  }

  return (
    <div className="app-shell">
      {screen === 'start' && (
        <Start onStart={() => setScreen('emailCode')} onOpenStaff={() => setScreen('staffRole')} />
      )}

      {screen === 'emailCode' && (
        <EmailCode
          onBack={() => setScreen('start')}
          onVerified={(verifiedEmail) => {
            setEmail(verifiedEmail)
            setSecondsLeft(SESSION_SECONDS)
            setScreen('capture')
          }}
        />
      )}

      {screen === 'capture' && (
        <Capture
          secondsLeft={secondsLeft}
          onDone={(capturedShots) => {
            setShots(capturedShots)
            setScreen('frame')
          }}
        />
      )}

      {screen === 'frame' && (
        <FrameSelect
          photos={shots}
          secondsLeft={secondsLeft}
          onBack={() => setScreen('capture')}
          onNext={(template, assignment) => {
            // Timer berhenti begitu Next diklik.
            clearInterval(timerRef.current)

            // TODO (fase Backend): kirim ke POST /api/orders --
            // - photos: SEMUA 6 hasil jepretan (shots) buat dilampirkan penuh ke email
            // - layout_id/arrangement: template.id / template.arrangement
            // - frame_assignment: assignment (index foto per slot) buat compose gambar hasil edit
            // - access_code: kode yang divalidasi di halaman EmailCode
            console.log('Submit order (stub):', { template, assignment, email, shots })

            setScreen('success')
          }}
        />
      )}

      {screen === 'success' && <Success email={email} onRestart={resetCustomerFlow} />}

      {/* ---------- Mode staff ---------- */}

      {screen === 'staffRole' && (
        <RoleSelect onBack={() => setScreen('start')} onSelect={(role) => { setIntendedRole(role); setScreen('staffLogin') }} />
      )}

      {screen === 'staffLogin' && (
        <StaffLogin
          intendedRole={intendedRole}
          onBack={() => setScreen('staffRole')}
          onLoggedIn={(data) => {
            setStaff(data)
            setScreen(data.role === 'admin' ? 'staffAdmin' : 'staffOperator')
          }}
        />
      )}

      {screen === 'staffAdmin' && (
        <AdminDashboard token={staff?.token} onLogout={() => { setStaff(null); setScreen('start') }} />
      )}

      {screen === 'staffOperator' && (
        <OperatorDashboard token={staff?.token} onLogout={() => { setStaff(null); setScreen('start') }} />
      )}
    </div>
  )
}
