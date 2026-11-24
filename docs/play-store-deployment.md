# Android Play Store deployment

## GitHub Actions

The **Android Play Store** workflow runs for version tags (`v*`) and can also be started from **Actions → Android Play Store → Run workflow**. It runs the readiness scan before building a production Android App Bundle and saves the `.aab` as a workflow artifact for 14 days.

Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `EXPO_TOKEN`: an Expo access token used by EAS Build and Submit.
- `PLAY_STORE_SERVICE_ACCOUNT_JSON`: the Google Play service-account key JSON. The workflow writes it to a temporary, git-ignored file only for submission.

Android app-signing credentials are managed by EAS Build, not stored in the repository. Configure or verify the production Android credentials in the Expo dashboard or with `eas credentials --platform android` before the first build.

For manual runs, leave **submit_to_play_store** unchecked to build only. Check it to upload the AAB as a draft on the internal testing track. The Google Play app must already exist, and the service account must have access to it. Tag-triggered runs only build the AAB; they do not submit it.

## Local commands

- `npm run check:playstore` scans app identity, EAS configuration, and required image assets.
- `npm run build:android:production` runs the scan, then starts the EAS production AAB build.

The scan checks repository configuration only. It cannot verify the Play Console listing, required declarations, account setup, or app-policy compliance. Complete those checks in Play Console before requesting production release. In particular, verify you have rights to use any third-party branding in the app and store listing.
