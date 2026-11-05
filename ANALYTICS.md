# Portfolio analytics

The Google Analytics 4 integration is configured with measurement ID `G-FQ9VSLVNW9`. Collection starts automatically on the deployed site. Visitors who previously declined remain excluded. Verify delivery in GA Realtime after deployment. The ID is public; no API key or secret belongs in this repository. No Google account/property has been created by this change.

## Activate and view your dashboard

1. Sign in at https://analytics.google.com/ with your Google account. Use **Start measuring** (or **Admin → Create → Account/Property**) to create a GA4 property. Choose your reporting timezone and currency.
2. Add a **Web** data stream using your portfolio's public website address. Copy its measurement ID, formatted `G-XXXXXXXXXX`.
3. Set `GA_MEASUREMENT_ID` at the top of `analytics.js` to that ID and deploy/push the update. Alternatively, send the public ID to your coding assistant to make that update. Do not send your password or private credentials.
4. In the stream's **Enhanced measurement** settings, disable automatic page changes from browser history and outbound clicks if enabled: this site sends explicit tab page views and outbound events. Native HTML video events are also tracked by this integration.
5. Open the deployed portfolio, visit Works, play a project video, and switch tabs. In Analytics, open **Reports → Realtime** to check incoming events. Ad blockers or browser privacy settings may prevent collection. Standard reports usually take 24–48 hours to populate.

## Reports

- **Reports → Engagement → Pages and screens**: virtual page titles end in home, works, pricing, or about.
- **Reports → Engagement → Events**: event counts for clicks, video plays/pauses/ends, progress and time.
- **Reports → Acquisition**: traffic sources. Device and approximate location reports depend on the data Google makes available.
- **Explore → Free form**: compare projects, tabs and time. First create event-scoped custom dimensions in **Admin → Custom definitions** for `project_name`, `tab_name`, `link_url`, `link_text`, and `video_percent`. Create custom metrics for `active_seconds` and `watch_seconds` with Seconds units. Definitions apply going forward and can take 24–48 hours to appear.

| Event | Meaning | Useful parameters |
| --- | --- | --- |
| `page_view` | Initial accepted visit and each tab selection | `tab_name`, `page_title`, `page_location` |
| `tab_engagement` | Time in the selected tab while the browser document is visible | `tab_name`, `active_seconds` |
| `outbound_click` | HTTP(S) link clicked to another origin | `link_url`, `link_text`, `tab_name` |
| `project_view_time` | Time with at least half the card (or half the viewport for tall cards) visible in Works | `project_name`, `active_seconds` |
| `project_watch_time` | Playback time while Works and the browser document are visible | `project_name`, `watch_seconds` |
| `project_video_play` / `project_video_pause` / `project_video_ended` | Native video playback actions | `project_name`, `video_position` |
| `project_video_progress` | First crossing of 25%, 50%, 75% during a playback | `project_name`, `video_percent` |

Time events send incremental totals every 15 seconds, on tab changes, playback actions, and document hiding/leaving. Sum the custom metrics by project or tab in Explore. These are approximate visible-page/playback times, not proof of attention. Seeking can trigger progress milestones; milestones do not prove continuous viewing. Tab switches pause project videos. Network loss, background timer throttling, abrupt closure, a previously saved refusal and blockers can reduce recorded data. An offline mocked test validates integration behavior; delivery to a real GA property must be checked after activation.

## Privacy

There is no analytics prompt or preferences button. Analytics starts automatically, except for visitors with a previously saved decline choice. No name, Discord account or Roblox account is collected by this code. Google Analytics uses cookies and pseudonymous browser identifiers; it does not reliably identify individual people. Outbound URLs omit query strings and fragments. Google Signals and advertising personalization are disabled. Use your GA account's retention and data controls appropriately.
