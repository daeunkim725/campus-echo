# Product User Journey Flow


**Download SVG:** [user_journey.svg](./user_journey.svg)

```mermaid
flowchart TD
  %% Entry / guards
  A[App start] --> B{Token exists?}
  B -- No --> C[/Onboarding School/]
  B -- Yes --> D[AuthContext checkAuth + apiMe]
  D --> E{Auth ok?}
  E -- No --> C
  E -- Yes --> F{Onboarding step needed?}

  %% Auth + onboarding
  subgraph O[Auth & Onboarding]
    C --> C1[Pick school]
    C1 --> V[/Onboarding Verify/]
    V --> V1{School email domain valid?}
    V1 -- No --> V
    V1 -- Yes --> V2[Send code]
    V2 --> V3{Code valid?}
    V3 -- No --> V
    V3 -- Yes --> P[/Onboarding Password/]
    P --> P1{Password policy + match?}
    P1 -- No --> P
    P1 -- Yes --> A1[/Onboarding Age/]
    A1 --> A2{Age >= 18?}
    A2 -- No --> A3[Lock until unlock_at]
    A3 --> A1
    A2 -- Yes --> PR[/Onboarding Profile/]
    PR --> PR1[Pick accessory]
    PR1 --> M[/Main app/]
  end

  F -- Yes --> O
  F -- No --> M

  %% Main navigation product loop
  subgraph N[Main Navigation]
    M --> T[TopBar / SchoolTopBar]
    T --> N1[Feed tab]
    T --> N2[Market tab]
    T --> N3[Events tab]
    T --> N4[Stats tab (admin)]
    T --> N5[Notif FAB menu]
    N5 --> N6[Notifications]
    N5 --> N7[MarketInbox]
  end

  %% Modal ecosystem
  subgraph MOD[Modal Openings]
    N1 --> MP1[CreatePostModal]
    N3 --> MP1
    N2 --> MM1[CreateListingModal]
    N2 --> MM2[ListingDetailModal]
    MM2 --> MM3[ChatModal]
    T --> PF1[ProfilePanel]
    PF1 --> PF2[Logout confirm modal]
  end

  %% Profile flow
  subgraph PF[Profile Flow]
    PF1 --> PF3[Posts tab]
    PF3 --> PF4[Edit post]
    PF3 --> PF5[Soft-delete post]
    PF1 --> PF6[Listings tab]
    PF6 --> PF7[Relist sold item]
    PF6 --> PF8[Archive/Delete sold]
    PF1 --> PF9[Regenerate handle]
    PF1 --> PF10[Toggle dark mode]
    PF2 --> L[/Login/]
  end

  %% Market/listing flow
  subgraph MK[Market & Listing Flow]
    N2 --> M1{School + age verified?}
    M1 -- No --> C
    M1 -- Yes --> M2[Listings feed]
    M2 --> M3[Filters: category/free/sold/sort]
    M2 --> MM1
    M2 --> MM2
    MM2 --> M4{Viewer is seller?}
    M4 -- Yes --> M5[Go MarketInbox / Mark sold]
    M4 -- No --> M6[Open/create thread]
    M6 --> MM3
    MM3 --> M7[Send text]
    MM3 --> M8[Offer flow]
    MM3 --> M9[Meetup plan + code]
    M5 --> N7
    N7 --> MM3
  end

  %% Files used
  subgraph FILES[Files used in this journey]
    F1[src/App.jsx]
    F2[src/lib/AuthContext.jsx]
    F3[src/pages/Login.jsx]
    F4[src/pages/onboarding/*]
    F5[src/components/feed/TopBar.jsx]
    F6[src/components/feed/SchoolTopBar.jsx]
    F7[src/pages/Market.jsx]
    F8[src/components/market/ListingDetailModal.jsx]
    F9[src/components/market/ChatModal.jsx]
    F10[src/pages/MarketInbox.jsx]
    F11[src/components/profile/ProfilePanel.jsx]
  end
```

## Notes on unclear / missing logic

- Onboarding pages mostly call `updateUser(...)` in context, but that is local state only; persistence to backend is not clear in these components (except verify/signup API calls). This may cause refresh-loss during onboarding.
- There are two routing systems in use: React Router paths like `/onboarding/*` and generated page links via `createPageUrl("Onboarding") -> /Onboarding`. Mixed casing/routes can lead to confusing redirects.
- `Onboarding.jsx` says onboarding now lives in `Login.jsx`, but real onboarding steps still exist in `src/pages/onboarding/*`, so documentation and implementation diverge.
- `Layout.jsx` intercepts `/onboarding/school` links and rewrites to `/OnboardingSchool`, which may conflict with router-managed onboarding paths.
- Login has a client-side admin bypass (fake token + localStorage) that skips server validation.
