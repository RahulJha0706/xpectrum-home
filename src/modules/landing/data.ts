// Copy and content for the public landing page. Kept in one place so
// marketing can change wording without touching layout code.
//
// Every claim here is meant to be something the product does today. Before
// adding one, check it against the app — notably: no CRM/calendar connectors
// ship by name, human handoff is limited to call transfer, cross-channel
// memory is voice↔SMS only, and Compliance/Guardrails are "Coming Soon".

export type ProductKey = 'chat' | 'automation' | 'knowledge' | 'channels' | 'integrations' | 'monitoring'

// The six product areas mirror the onboarding welcome modal
// (modules/workspace/onboarding/welcome-modal.tsx), so the home page
// describes the product with the same vocabulary as the app.
export const PRODUCTS: {
  key: ProductKey
  name: string
  // The benefit, in one line: the card headline.
  headline: string
  short: string
  long: string
  color: string
}[] = [
  {
    key: 'chat',
    headline: 'Agents that talk, reason and act',
    name: 'Conversational Apps',
    short: 'Agent flows & chatbots',
    long: 'Agent flows, AI chatbots and autonomous agents. Branch on intent, call tools and carry context across turns, then put the agent on a channel, your website or the API.',
    color: '#5a99eb',
  },
  {
    key: 'automation',
    headline: 'Workflows that run themselves',
    name: 'Automation',
    short: 'Workflows & triggers',
    long: 'Workflows that run start to finish on a schedule or a webhook, with AI models, knowledge search, HTTP requests, custom code and loops. Publish any workflow as an MCP tool.',
    color: '#22d3ee',
  },
  {
    key: 'knowledge',
    headline: 'Answers from your own documents',
    name: 'Knowledge',
    short: 'Ground agents in your docs',
    long: 'Upload files, sync Notion, crawl your website or pull YouTube transcripts on a schedule. Hybrid search with re-ranking keeps answers grounded in your own data.',
    color: '#7c5cff',
  },
  {
    key: 'channels',
    headline: 'One agent, every channel',
    name: 'Channels',
    short: 'Voice, phone, SMS & email',
    long: 'Real-time voice agents on phone numbers you buy in-app, outbound batch call campaigns, two-way SMS, WhatsApp Business and email inboxes.',
    color: '#d25cff',
  },
  {
    key: 'integrations',
    headline: 'Plug into the systems you use',
    name: 'Integrations',
    short: 'Models, tools & MCP',
    long: 'Bring the model providers you prefer, add tools from any OpenAPI schema or plugin, and connect MCP servers. Your agents can reach any system with an API.',
    color: '#34d399',
  },
  {
    key: 'monitoring',
    headline: 'See every run, cost and outcome',
    name: 'Monitoring',
    short: 'Usage, metrics & logs',
    long: 'Latency, tokens and error rates. Call outcomes and sentiment from every transcript. Cost per app, itemised, and a full audit trail of who changed what, and when.',
    color: '#5eead4',
  },
]

// The industry options from workspace onboarding
// (app/workspace-setup/onboarding-questions.tsx), plus agencies, who run
// Xpectrum for their clients through client workspaces.
export const INDUSTRIES = [
  'Healthcare',
  'Real estate',
  'Retail',
  'Finance',
  'Logistics',
  'Travel',
  'Education',
  'Agencies',
]

// Product facts rather than traction numbers — each one is verifiable in the
// app. Swap in customer metrics here once there are real ones to publish.
export const STATS: { value: number; suffix: string; label: string; decimals?: number }[] = [
  { value: 5, suffix: '', label: 'channels from one agent: voice, SMS, WhatsApp, email and web chat' },
  { value: 0, suffix: '%', label: 'markup on models, speech and telephony, which are passed through at cost' },
  { value: 4, suffix: '', label: 'voice engines to choose from: Cartesia, ElevenLabs, OpenAI and Sarvam' },
  { value: 1, suffix: '', label: 'execution per reply, email or workflow run, with loops and tool calls included' },
]

// The agent Service API as documented in-app
// (modules/agents/api-docs/template/template_advanced_chat.en.mdx).
export const CODE_SAMPLE = `const res = await fetch(\`\${API_BASE}/v1/chat-messages\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.XPECTRUM_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: {},
    query: 'Can I move my cleaning to Friday?',
    response_mode: 'streaming',
    conversation_id: '',
    user: 'patient-4821',
  }),
})

// Server-sent events, streamed as the agent answers
for await (const chunk of res.body)
  render(new TextDecoder().decode(chunk))`

export const CURL_SAMPLE = `curl -X POST "$API_BASE/v1/chat-messages" \\
  -H "Authorization: Bearer $XPECTRUM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": {},
    "query": "Can I move my cleaning to Friday?",
    "response_mode": "streaming",
    "conversation_id": "",
    "user": "patient-4821"
  }'`
