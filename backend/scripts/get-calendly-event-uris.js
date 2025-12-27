require('dotenv').config();
const axios = require('axios');

async function getEventTypeUris() {
  try {
    const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
    
    if (!token) {
      console.error('❌ CALENDLY_PERSONAL_ACCESS_TOKEN not found in .env file');
      console.log('\n💡 Please add your Personal Access Token to .env file:');
      console.log('CALENDLY_PERSONAL_ACCESS_TOKEN=your_token_here\n');
      return;
    }

    console.log('🔍 Fetching user info from Calendly...\n');

    // First get current user to get the user URI
    const userResponse = await axios.get(
      'https://api.calendly.com/users/me',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const userUri = userResponse.data.resource.uri;
    console.log(`✅ User URI: ${userUri}\n`);

    console.log('🔍 Fetching Event Types...\n');

    const response = await axios.get(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const eventTypes = response.data.collection;

    if (eventTypes.length === 0) {
      console.log('⚠️  No Event Types found in your Calendly account.');
      console.log('💡 Please create Event Types in Calendly dashboard first.\n');
      return;
    }

    console.log(`✅ Found ${eventTypes.length} Event Type(s):\n`);
    console.log('═'.repeat(80));

    eventTypes.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.name}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Duration: ${event.duration} minutes`);
      console.log(`   URI: ${event.uri}`);
      console.log(`   Active: ${event.active ? 'Yes' : 'No'}`);
    });

    console.log('\n' + '═'.repeat(80));

    // Try to find events by duration
    const event30 = eventTypes.find(e => e.duration === 30);
    const event60 = eventTypes.find(e => e.duration === 60 || e.slug.includes('60'));
    const event90 = eventTypes.find(e => e.duration === 90);

    console.log('\n🎯 Recommended .env Configuration:\n');

    if (event30) {
      console.log(`CALENDLY_EVENT_TYPE_URI_30MIN=${event30.uri}`);
    } else {
      console.log('CALENDLY_EVENT_TYPE_URI_30MIN=https://api.calendly.com/event_types/YOUR_30MIN_URI_HERE  # ⚠️ 30 min event type not found');
    }

    if (event60) {
      console.log(`CALENDLY_EVENT_TYPE_URI_60MIN=${event60.uri}`);
    } else {
      console.log('CALENDLY_EVENT_TYPE_URI_60MIN=https://api.calendly.com/event_types/YOUR_60MIN_URI_HERE  # ⚠️ 60 min event type not found');
    }

    if (event90) {
      console.log(`CALENDLY_EVENT_TYPE_URI_90MIN=${event90.uri}`);
    } else {
      console.log('CALENDLY_EVENT_TYPE_URI_90MIN=https://api.calendly.com/event_types/YOUR_90MIN_URI_HERE  # ⚠️ 90 min event type not found');
    }

    console.log('\n✅ Copy these URIs to your .env file!\n');

  } catch (error) {
    console.error('\n❌ Error fetching Event Types:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.statusText}`);
      if (error.response.status === 401) {
        console.error('\n💡 Authentication failed. Please check your Personal Access Token.');
      }
    } else {
      console.error(`   ${error.message}`);
    }
    console.log('');
  }
}

getEventTypeUris();

