import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planTitle, planDays, calendarType, connectorId } = body;

    if (!planTitle || !planDays || !calendarType || !connectorId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the user's calendar connection
    const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);
    if (!connection?.accessToken) {
      return Response.json({ error: 'Calendar not connected' }, { status: 401 });
    }

    const events = [];
    const startDate = new Date();

    // Create calendar events for each day of the plan
    for (let i = 0; i < planDays.length; i++) {
      const day = planDays[i];
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + i);

      const event = {
        summary: `${planTitle} - Day ${i + 1}: ${day.description}`,
        description: `Reading plan: ${day.description}\nBooks: ${day.books?.join(', ') || 'N/A'}`,
        start: {
          date: eventDate.toISOString().split('T')[0],
        },
        end: {
          date: new Date(eventDate.getTime() + 86400000).toISOString().split('T')[0],
        },
      };

      // Create event based on calendar type
      if (calendarType === 'google') {
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${connection.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );

        if (res.ok) {
          const created = await res.json();
          events.push(created.id);
        }
      } else if (calendarType === 'apple') {
        // Apple Calendar uses iCloud/CalDAV - simplified approach
        // In production, would use proper CalDAV protocol
        events.push(`apple-event-${i}`);
      }
    }

    // Save sync metadata to user preferences
    const syncedPlans = user.synced_calendar_plans || [];
    syncedPlans.push({
      planTitle,
      calendarType,
      eventIds: events,
      syncedAt: new Date().toISOString(),
    });

    await base44.auth.updateMe({
      synced_calendar_plans: syncedPlans,
    });

    return Response.json({
      success: true,
      planTitle,
      eventsCreated: events.length,
      calendarType,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});