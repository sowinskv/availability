"""
Calendar integration service for Google Calendar and Outlook.
"""
import httpx
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..exceptions import OAuthTokenExpired, CalendarSyncError


class CalendarIntegrationService:
    """Service for syncing with external calendars."""

    def __init__(self, provider: str = "google"):
        self.provider = provider
        self.google_calendar_api = "https://www.googleapis.com/calendar/v3"
        self.outlook_calendar_api = "https://graph.microsoft.com/v1.0"

    async def sync_availability(
        self,
        access_token: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Sync availability from external calendar.

        Args:
            access_token: OAuth access token
            start_date: Start date for sync
            end_date: End date for sync

        Returns:
            List of availability periods

        Raises:
            OAuthTokenExpired: If token has expired
            CalendarSyncError: If sync fails
        """
        if self.provider == "google":
            return await self._sync_google_calendar(access_token, start_date, end_date)
        elif self.provider == "outlook":
            return await self._sync_outlook_calendar(access_token, start_date, end_date)
        else:
            raise CalendarSyncError(f"Unsupported calendar provider: {self.provider}")

    async def _sync_google_calendar(
        self,
        access_token: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Sync from Google Calendar."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {"Authorization": f"Bearer {access_token}"}
                params = {
                    "timeMin": start_date.isoformat() + "Z",
                    "timeMax": end_date.isoformat() + "Z",
                    "singleEvents": True,
                    "orderBy": "startTime"
                }

                response = await client.get(
                    f"{self.google_calendar_api}/calendars/primary/events",
                    headers=headers,
                    params=params
                )

                if response.status_code == 401:
                    raise OAuthTokenExpired("Google Calendar token expired")

                response.raise_for_status()
                events = response.json().get("items", [])

                # Convert events to availability periods
                availabilities = []
                for event in events:
                    if event.get("transparency") == "transparent":
                        # Skip transparent events (available time)
                        continue

                    start = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date")
                    end = event.get("end", {}).get("dateTime") or event.get("end", {}).get("date")

                    if start and end:
                        availabilities.append({
                            "start_date": start.split("T")[0],
                            "end_date": end.split("T")[0],
                            "type": "vacation" if "vacation" in event.get("summary", "").lower() else "partial",
                            "hours_per_day": 0 if "vacation" in event.get("summary", "").lower() else 4
                        })

                return availabilities

        except OAuthTokenExpired:
            raise
        except httpx.HTTPStatusError as e:
            raise CalendarSyncError(f"Google Calendar sync failed: {e.response.status_code}")
        except Exception as e:
            raise CalendarSyncError(f"Google Calendar sync failed: {str(e)}")

    async def _sync_outlook_calendar(
        self,
        access_token: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Sync from Outlook Calendar."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {"Authorization": f"Bearer {access_token}"}
                params = {
                    "$filter": f"start/dateTime ge '{start_date.isoformat()}' and end/dateTime le '{end_date.isoformat()}'",
                    "$orderby": "start/dateTime"
                }

                response = await client.get(
                    f"{self.outlook_calendar_api}/me/calendar/events",
                    headers=headers,
                    params=params
                )

                if response.status_code == 401:
                    raise OAuthTokenExpired("Outlook Calendar token expired")

                response.raise_for_status()
                events = response.json().get("value", [])

                # Convert events to availability periods
                availabilities = []
                for event in events:
                    if event.get("showAs") == "free":
                        continue

                    start = event.get("start", {}).get("dateTime")
                    end = event.get("end", {}).get("dateTime")

                    if start and end:
                        availabilities.append({
                            "start_date": start.split("T")[0],
                            "end_date": end.split("T")[0],
                            "type": "vacation" if event.get("showAs") == "oof" else "partial",
                            "hours_per_day": 0 if event.get("showAs") == "oof" else 4
                        })

                return availabilities

        except OAuthTokenExpired:
            raise
        except httpx.HTTPStatusError as e:
            raise CalendarSyncError(f"Outlook Calendar sync failed: {e.response.status_code}")
        except Exception as e:
            raise CalendarSyncError(f"Outlook Calendar sync failed: {str(e)}")
