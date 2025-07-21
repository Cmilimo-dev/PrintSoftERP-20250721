import { supabase } from './src/integrations/supabase/client';

async function setupTables() {
  try {
    // Creating Permissions Table
    let { error: createPermissionsError } = await supabase
      .rpc('create_permissions_table');
    if (createPermissionsError) throw createPermissionsError;

    // Creating Leads Table
    let { error: createLeadsError } = await supabase
      .rpc('create_leads_table');
    if (createLeadsError) throw createLeadsError;

    // More tables as needed...

    console.log("Tables created successfully!");
  } catch (error) {
    console.error('Error setting up tables:', error.message);
  }
}

setupTables();
