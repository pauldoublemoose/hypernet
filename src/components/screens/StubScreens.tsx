import type { ReactNode } from 'react'
import { useKeys } from '../../hooks'

function StubPane({
  title,
  lead,
  onBack,
  children,
}: {
  title: string
  lead: string
  onBack: () => void
  children?: ReactNode
}) {
  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    onBack()
  })

  return (
    <div className="screen hz-screen">
      <h2 className="hz-heading">{title}</h2>
      <p className="dim hz-lead">{lead}</p>
      {children}
    </div>
  )
}

const GLOBAL_UPDATES = [
  { when: 'just now', text: 'New user joined the network — welcome, @signal.' },
  { when: '12m ago', text: 'New event published: Deep Listening Lab · Stockholm.' },
  { when: '1h ago', text: 'Horizon “Baltic Circuit” added three dates.' },
  { when: 'yesterday', text: '@nova and @ember are now Friends.' },
  { when: 'just now', text: 'Clusters unlocked — browse the directory or create a camp.' },
  { when: '2d ago', text: 'New Cluster pending (locked) — camps unlock later.' },
]

export function AnnouncementsScreen({ onBack }: { onBack: () => void }) {
  return (
    <StubPane
      title="Global Announcements"
      lead="Network message board — local demo feed (was Terminal Global Updates)."
      onBack={onBack}
    >
      <ul className="hz-list">
        {GLOBAL_UPDATES.map((u) => (
          <li key={u.text} className="hz-list-static">
            <span className="hz-list-title">{u.text}</span>
            <span className="dim">{u.when}</span>
          </li>
        ))}
      </ul>
    </StubPane>
  )
}

export function GlobalChatScreen({ onBack }: { onBack: () => void }) {
  return (
    <StubPane
      title="Global Chat"
      lead="Network-wide chat is not live yet. Stub UI only (was a Terminal tab)."
      onBack={onBack}
    >
      <section className="hz-panel">
        <ul className="hz-list">
          <li className="hz-list-static">
            <span className="dim">No messages yet — coming soon.</span>
          </li>
        </ul>
        <label className="hz-field" style={{ marginTop: 12 }}>
          <span>Message</span>
          <input className="profile-input" disabled placeholder="Global Chat coming soon" value="" readOnly />
        </label>
        <div className="btn-row">
          <button type="button" className="btn dim" disabled>
            Send (coming soon)
          </button>
        </div>
      </section>
    </StubPane>
  )
}

export function DiscoverNotesScreen({ onBack }: { onBack: () => void }) {
  return (
    <StubPane
      title="Find Nodes"
      lead="Search the network for people and nodes. Placeholder — was Find the others."
      onBack={onBack}
    >
      <section className="hz-panel">
        <label className="hz-field">
          <span>Search</span>
          <input
            className="profile-input"
            disabled
            placeholder="Find Nodes coming soon"
            value=""
            readOnly
          />
        </label>
        <ul className="hz-list">
          <li className="hz-list-static">
            <span className="dim">No nodes yet — coming soon.</span>
          </li>
        </ul>
      </section>
    </StubPane>
  )
}

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <StubPane
      title="My Notifications"
      lead="Personal alerts are not live yet. Stub UI only."
      onBack={onBack}
    >
      <ul className="hz-list">
        <li className="hz-list-static">
          <span className="hz-list-title">Inbox empty</span>
          <span className="dim">Friend requests, event updates, and follows will land here.</span>
        </li>
      </ul>
    </StubPane>
  )
}

export function ChronicleScreen({ onBack }: { onBack: () => void }) {
  return (
    <StubPane
      title="My Chronicle"
      lead="Personal event history, roles, and unconfirmed entries (Interested, past Horizons). Stub."
      onBack={onBack}
    >
      <ul className="hz-list">
        <li className="hz-list-static">
          <span className="hz-list-title">No entries yet</span>
          <span className="dim">Going roles and past events will land here. Interested stays unconfirmed.</span>
        </li>
      </ul>
    </StubPane>
  )
}

export function MyChatsScreen({ onBack }: { onBack: () => void }) {
  return (
    <StubPane
      title="My Chats"
      lead="Private threads are not live yet. Stub UI only."
      onBack={onBack}
    >
      <section className="hz-panel">
        <ul className="hz-list">
          <li className="hz-list-static">
            <span className="dim">No threads yet — coming soon. Network-wide chat is Global Chat on the left.</span>
          </li>
        </ul>
        <label className="hz-field" style={{ marginTop: 12 }}>
          <span>Message</span>
          <input className="profile-input" disabled placeholder="My Chats coming soon" value="" readOnly />
        </label>
        <div className="btn-row">
          <button type="button" className="btn dim" disabled>
            Send (coming soon)
          </button>
        </div>
      </section>
    </StubPane>
  )
}
