
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock3, Users, Stethoscope, Wallet, Settings, Plus, Filter, CreditCard } from 'lucide-react'

const API = {
  async get(path) { const r = await fetch(`/api${path}`); return r.json(); },
  async post(path, body) { const r = await fetch(`/api${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}); return r.json(); },
  async patch(path, body) { const r = await fetch(`/api${path}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)}); return r.json(); },
  async del(path) { const r = await fetch(`/api${path}`, { method:'DELETE' }); return r.ok; },
};

function Nav({ tab, setTab }) {
  const items = [
    ['dashboard','Dashboard', <Calendar key='i' className='w-4 h-4'/>],
    ['appointments','Appointments', <Stethoscope key='i' className='w-4 h-4'/>],
    ['clients','Clients', <Users key='i' className='w-4 h-4'/>],
    ['services','Services', <FileIcon/>],
    ['payments','Payments', <Wallet key='i' className='w-4 h-4'/>],
    ['settings','Settings', <Settings key='i' className='w-4 h-4'/>],
  ];
  return (
    <div className='flex gap-2 flex-wrap'>
      {items.map(([k, label, icon])=> (
        <button key={k} className={`px-3 py-2 rounded-lg border ${tab===k?'bg-blue-600 text-white':'bg-white hover:bg-neutral-50'}`} onClick={()=>setTab(k)}>
          <span className='inline-flex items-center gap-2'>{icon}{label}</span>
        </button>
      ))}
    </div>
  );
}

function FileIcon(){ return <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M7 3h6l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z'/></svg> }

function Stat({label,value,sub}){
  return (
    <div className='rounded-2xl bg-white border p-4'>
      <div className='text-2xl font-semibold'>{value}</div>
      <div className='text-sm text-neutral-500'>{label}</div>
      {sub && <div className='mt-2 inline-block text-xs px-2 py-1 rounded bg-neutral-100'>{sub}</div>}
    </div>
  )
}

function useData(){
  const [clients, setClients] = useState([])
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const reload = async ()=>{
    const [c, s, sv, a, inv] = await Promise.all([API.get('/clients'), API.get('/staff'), API.get('/services'), API.get('/appointments'), API.get('/invoices')])
    setClients(c); setStaff(s); setServices(sv); setAppointments(a); setInvoices(inv);
  }
  useEffect(()=>{ reload() },[])
  return { clients, staff, services, appointments, invoices, reload }
}

export default function App(){
  const [tab, setTab] = useState('dashboard')
  const [creating, setCreating] = useState(false)
  const { clients, staff, services, appointments, invoices, reload } = useData()
  const today = new Date().toISOString().slice(0,10)
  const todaysAppts = useMemo(()=>appointments.filter(a => a.date.slice(0,10)===today),[appointments])

  return (
    <div className='min-h-screen'>
      <header className='sticky top-0 z-20 bg-white/80 backdrop-blur border-b'>
        <div className='max-w-6xl mx-auto px-4 py-3 flex items-center gap-4'>
          <img className='w-8 h-8 rounded-lg object-cover' src='https://images.unsplash.com/photo-1580281657527-47e6ba6b34d0?q=80&w=256&auto=format&fit=crop' />
          <div className='font-semibold'>PulseBook CRM</div>
          <div className='ml-auto'><Nav tab={tab} setTab={setTab}/></div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-8'>
        {tab==='dashboard' && (
          <section className='grid gap-6'>
            <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className='text-3xl font-semibold'>Appointment Booking CRM</motion.h1>
            <div className='grid md:grid-cols-4 gap-4'>
              <Stat label="Active Clients" value={clients.length} />
              <Stat label="Today's Appointments" value={todaysAppts.length} />
              <Stat label="Services" value={services.length} />
              <Stat label="Invoices" value={invoices.length} />
            </div>
            <div className='rounded-2xl bg-white border p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-medium'>Appointments Today</div>
                  <div className='text-sm text-neutral-500'>{today}</div>
                </div>
                <button onClick={()=>setTab('appointments')} className='px-3 py-2 rounded-lg bg-blue-600 text-white'>Manage</button>
              </div>
              <div className='mt-3 grid gap-2'>
                {todaysAppts.map(a => (
                  <div key={a.id} className='flex items-center justify-between border rounded-xl p-3'>
                    <div className='flex items-center gap-3'>
                      <span className='text-xs px-2 py-1 rounded bg-neutral-100'>{new Date(a.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      <div>
                        <div className='font-medium'>{a.service?.name}</div>
                        <div className='text-xs text-neutral-500'>{a.client?.name} • {a.staff?.name}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${a.status==='confirmed'?'bg-green-100 text-green-700':'bg-neutral-100'}`}>{a.status}</span>
                  </div>
                ))}
                {todaysAppts.length===0 && <div className='text-sm text-neutral-500'>No bookings today.</div>}
              </div>
            </div>
          </section>
        )}

        {tab==='appointments' && <Appointments services={services} staff={staff} clients={clients} onCreated={reload} appointments={appointments} />}
        {tab==='clients' && <Clients clients={clients} onChange={reload} />}
        {tab==='services' && <Services services={services} onChange={reload} />}
        {tab==='payments' && <Payments invoices={invoices} onChange={reload} />}
        {tab==='settings' && <Settings />}
      </main>
    </div>
  )
}

function Appointments({ services, staff, clients, onCreated, appointments }){
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [time, setTime] = useState('10:00')
  const [serviceId, setServiceId] = useState(services[0]?.id)
  const [staffId, setStaffId] = useState(staff[0]?.id)
  const [clientId, setClientId] = useState(clients[0]?.id)
  const [note, setNote] = useState('')

  const dayList = useMemo(()=>appointments.filter(a=>a.date.slice(0,10)===date),[appointments,date])

  async function create(){
    const svc = services.find(s=>s.id===serviceId)
    const iso = new Date(`${date}T${time}:00`).toISOString()
    const res = await API.post('/appointments', { date: iso, duration: svc.duration, clientId, staffId, serviceId, notes: note })
    if(res.error){ alert(res.error); return }
    onCreated()
  }

  return (
    <section className='grid gap-6'>
      <div className='rounded-2xl bg-white border p-4 flex items-end gap-3 flex-wrap'>
        <div>
          <label className='text-xs text-neutral-500'>Date</label>
          <input className='border rounded-lg p-2' type='date' value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <label className='text-xs text-neutral-500'>Time</label>
          <input className='border rounded-lg p-2' type='time' value={time} onChange={e=>setTime(e.target.value)} />
        </div>
        <div>
          <label className='text-xs text-neutral-500'>Service</label>
          <select className='border rounded-lg p-2' value={serviceId} onChange={e=>setServiceId(e.target.value)}>
            {services.map(s=> <option value={s.id} key={s.id}>{s.name} ({s.duration}m)</option>)}
          </select>
        </div>
        <div>
          <label className='text-xs text-neutral-500'>Staff</label>
          <select className='border rounded-lg p-2' value={staffId} onChange={e=>setStaffId(e.target.value)}>
            {staff.map(s=> <option value={s.id} key={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className='text-xs text-neutral-500'>Client</label>
          <select className='border rounded-lg p-2' value={clientId} onChange={e=>setClientId(e.target.value)}>
            {clients.map(c=> <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={create} className='ml-auto px-3 py-2 rounded-lg bg-blue-600 text-white inline-flex items-center gap-2'><Plus className='w-4 h-4'/>Create</button>
      </div>

      <div className='rounded-2xl bg-white border p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='font-medium'>Appointments on {date}</div>
            <div className='text-sm text-neutral-500'>{dayList.length} bookings</div>
          </div>
          <button className='px-3 py-2 rounded-lg border inline-flex items-center gap-2'><Filter className='w-4 h-4'/>Filters</button>
        </div>
        <div className='mt-3 grid gap-2'>
          {dayList.map(a => (
            <div key={a.id} className='flex items-center justify-between border rounded-xl p-3'>
              <div className='flex items-center gap-3'>
                <span className='text-xs px-2 py-1 rounded bg-neutral-100'>{new Date(a.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                <div>
                  <div className='font-medium'>{a.service?.name}</div>
                  <div className='text-xs text-neutral-500'>{a.client?.name} • {a.staff?.name}</div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${a.status==='confirmed'?'bg-green-100 text-green-700':'bg-neutral-100'}`}>{a.status}</span>
            </div>
          ))}
          {dayList.length===0 && <div className='text-sm text-neutral-500'>No bookings on this day.</div>}
        </div>
      </div>
    </section>
  )
}

function Clients({ clients, onChange }){
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [phone,setPhone]=useState('')
  async function add(){ await API.post('/clients',{name,email,phone}); setName(''); setEmail(''); setPhone(''); onChange() }
  return (
    <section className='grid gap-6'>
      <div className='rounded-2xl bg-white border p-4 flex gap-3 flex-wrap'>
        <input className='border rounded-lg p-2' placeholder='Name' value={name} onChange={e=>setName(e.target.value)} />
        <input className='border rounded-lg p-2' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} />
        <input className='border rounded-lg p-2' placeholder='Phone' value={phone} onChange={e=>setPhone(e.target.value)} />
        <button onClick={add} className='ml-auto px-3 py-2 rounded-lg bg-blue-600 text-white'>Add Client</button>
      </div>
      <div className='grid md:grid-cols-2 gap-3'>
        {clients.map(c=> (
          <div key={c.id} className='border rounded-2xl bg-white p-4'>
            <div className='font-medium'>{c.name}</div>
            <div className='text-sm text-neutral-500'>{c.email} • {c.phone}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Services({ services, onChange }){
  const [name,setName]=useState(''); const [duration,setDuration]=useState(30); const [price,setPrice]=useState(4900)
  async function add(){ await API.post('/services',{name,duration:Number(duration),price:Number(price)}); setName(''); setDuration(30); setPrice(4900); onChange() }
  return (
    <section className='grid gap-6'>
      <div className='rounded-2xl bg-white border p-4 flex gap-3 flex-wrap'>
        <input className='border rounded-lg p-2' placeholder='Service name' value={name} onChange={e=>setName(e.target.value)} />
        <input className='border rounded-lg p-2' type='number' placeholder='Duration (min)' value={duration} onChange={e=>setDuration(e.target.value)} />
        <input className='border rounded-lg p-2' type='number' placeholder='Price (cents)' value={price} onChange={e=>setPrice(e.target.value)} />
        <button onClick={add} className='ml-auto px-3 py-2 rounded-lg bg-blue-600 text-white'>Add Service</button>
      </div>
      <div className='grid md:grid-cols-2 gap-3'>
        {services.map(s=> (
          <div key={s.id} className='border rounded-2xl bg-white p-4 flex items-center justify-between'>
            <div>
              <div className='font-medium'>{s.name}</div>
              <div className='text-sm text-neutral-500'>{s.duration} min • ${(s.price/100).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Payments({ invoices, onChange }){
  const unpaid = invoices.filter(i=>i.status!=='paid')
  async function collect(id){
    await API.post('/payments/collect',{invoiceId:id}); onChange()
  }
  return (
    <section className='grid gap-6'>
      <div className='grid md:grid-cols-3 gap-4'>
        <Stat label='Invoices' value={invoices.length} />
        <Stat label='Outstanding Dues' value={'$'+(unpaid.reduce((s,i)=>s+i.amount,0)/100).toFixed(2)} />
        <Stat label='Paid' value={invoices.filter(i=>i.status==='paid').length} />
      </div>
      <div className='rounded-2xl bg-white border p-4'>
        <div className='font-medium mb-3'>Invoices</div>
        <div className='grid gap-2'>
          {invoices.map(i=> (
            <div key={i.id} className='flex items-center justify-between border rounded-xl p-3'>
              <div>
                <div className='font-medium'>{i.id}</div>
                <div className='text-xs text-neutral-500'>{i.client?.name} • {i.service?.name}</div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='text-sm'>${(i.amount/100).toFixed(2)}</div>
                {i.status!=='paid' ? <button onClick={()=>collect(i.id)} className='px-3 py-2 rounded-lg border inline-flex items-center gap-2'><CreditCard className='w-4 h-4'/>Collect</button> : <span className='text-xs px-2 py-1 rounded bg-green-100 text-green-700'>paid</span>}
              </div>
            </div>
          ))}
          {invoices.length===0 && <div className='text-sm text-neutral-500'>No invoices yet.</div>}
        </div>
      </div>
    </section>
  )
}

function Settings(){
  return (
    <section className='grid md:grid-cols-2 gap-6'>
      <div className='rounded-2xl bg-white border p-4'>
        <div className='font-medium mb-2'>Business Profile</div>
        <div className='text-sm text-neutral-500'>This is a demo section. Ask to wire it to the API.</div>
      </div>
      <div className='rounded-2xl bg-white border p-4'>
        <div className='font-medium mb-2'>Notifications</div>
        <div className='text-sm text-neutral-500'>Configure reminders later.</div>
      </div>
    </section>
  )
}
