import type { Status } from '../types'

export const WELCOME_INTRO = `WELCOME to pre-alpha HYPERNET!

HYPERNET is an international network of art, tech and experience creators.`

export const WELCOME_JOIN = `JOIN if you want to be invited when HYPERNET members create new experiences.`

export const ABOUT_SECTIONS: { id: string; header: string; body: string }[] = [
  {
    id: 'origin',
    header: 'ORIGIN: HYPERSTITION',
    body: `HYPERSTITION was a 4-year art project taking place at a Scandinavian regional burn. The project explored the concept of hyperstition as i) a process of creative manifestation and ii) an organizing principle of group intelligence.

HYPERSTITION produced multi-media art, including (but not limited to) experience design, roleplay & performances, sound stages, laser shows, intellectual conferences, live music, sculptures, digital art, tech installations, and printed magazines.

OVER THE YEARS 100+ ambitious members have participated in producing experiences under the HYPERSTITION name (and many more in overlapping projects).

HYPERSTITION came to a conclusion in 2026: EXIT, when the project set off to the Moon, never to come back.

While HYPERSTITION as a project is over, we wish that its connections and community will continue to grow and innovate.

HYPERNET is a sincere attempt to preserve the relationships seeded by HYPERSTITION and expand this network and its productivity beyond the context of its birthplace.`,
  },
  {
    id: 'purpose',
    header: 'PURPOSE: PARTICIPATORY COMMUNITY',
    body: `HYPERNET is a project sprung from the petri-dish of the principles of Burning Man and the plethora of participatory culture.

OUR TASTE and creative experiences have led us to develop our own set of values, emphasising different aspects of participatory principles. We have our own interpretations and additions, which we are working on expressing in writing. (Joining HYPERNET does not presuppose endorsement of our principles, but it does necessitate engagement with them.)

HYPERNET is one out of many co-evolving strains of participatory culture, and we aim to share and refine the best of what works for us.`,
  },
  {
    id: 'roadmap',
    header: 'ROADMAP: FROM PRIVATE DATABASE TO EVENT-BASED NETWORKING PLATFORM',
    body: `THIS FIRST ITERATION of HYPERNET is simply a database functioning as an address book or subscriber list, visible only to the admins / core organizers of HYPERNET. (You may sign up to be notified of future events — and when the next iteration of HYPERNET drops.)

THE NEXT VERSION will feature log-in credentials and basic personal profile functionality.

THE MOONSHOT VISION is for HYPERNET to become a semi-closed networking platform, tailor-made for art, tech and experience creators in the participatory community. (Anything you share here stays with HYPERNET admins / core organizers only — it will not be made public or shared with others in later versions without your consent.)

REACH OUT if you want to join the software development team creating HYPERNET!`,
  },
]

export const PRE_STATUS_TEXT = `On the following page you may sign up to simply stay posted for when the next thing drops, or you can flag yourself as a potential co-creator.`

export const STATUS_QUESTION = 'IN WHAT CAPACITY ARE YOU JOINING HYPERNET?'

export const STATUS_OPTIONS: { id: Status; label: string; desc: string }[] = [
  {
    id: 'subscriber',
    label: 'SUBSCRIBER',
    desc: 'I just want to know when the next thing is happening and be invited as a guest.',
  },
  {
    id: 'prospect',
    label: 'PROSPECTIVE CO-CREATOR',
    desc: 'I have never collaborated with the HYPERSTITION team, but I would love to find a way to do this in the future.',
  },
  {
    id: 'cocreator',
    label: 'KNOWN CO-CREATOR',
    desc: 'I have at some point, somehow (in a small or big way) contributed to HYPERSTITION, or I am a known co-creator to the team.',
  },
  {
    id: 'legacy',
    label: 'LEGACY MEMBER',
    desc: 'I am a former HYPERSTITION camp member. (As a legacy member you will be invited in the same capacity as a known co-creator.)',
  },
]

export const BRANCH_TEXT: Partial<Record<Status, string>> = {
  subscriber: `You have signed up as a SUBSCRIBER.

You will be placed on the broadcast newsletter list and may be notified the next time something is happening.

We will ask for your name, email and WhatsApp number. All questions are skippable.`,
  prospect: `Great that you are interested in co-creating with the HYPERNET community!

You will be asked for some basic info, including what skillset you might contribute.

If you don't want to provide complete information, remember that questions are skippable.`,
  cocreator: `How great that you have collaborated with HYPERSTITION and want to do more — you are most welcome.

Next you will be asked for basic contact info and for the skillset you can contribute.`,
  legacy: `Welcome back, treasured HYPERSTITION alumni!

(As a legacy member you will be invited in the same capacity as a known co-creator.)

Next you will be asked for basic contact info and for the skillset you can contribute.`,
}

export const EVENTS = [
  { id: '2023', label: 'HYPERSTITION 2023 — PILOT PROBE: OP. STRONG SIGNAL' },
  { id: '2024', label: 'HYPERSTITION 2024 — RESEARCH OUTPOST: OP. FUTURE SHOCK' },
  { id: '2025', label: 'HYPERSTITION 2025 — DEEP STATE SPEAKEASY OP. C.R.I.C.K.E.T.S' },
  { id: '2026', label: 'HYPERSTITION 2026 — EXIT' },
]

export const CONTACT_CHANNEL_OPTIONS = [
  { id: 'email', label: 'EMAIL' },
  { id: 'phone', label: 'PHONE / WHATSAPP' },
  { id: 'discord', label: 'DISCORD' },
  { id: 'facebook', label: 'FACEBOOK' },
]

export const THANKS_TEXT = `Thank you very much! You have now added your node to the pre-alpha version of HYPERNET.`

export const STAY_TUNED_TEXT = `Stay tuned for the next version of HYPERNET and its expressions.`
