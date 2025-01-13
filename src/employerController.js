const { Pool } = pkg;  // PostgreSQL client for Node.js

// Create a new pool connection to your PostgreSQL database
const user_pool = new Pool({
  user: 'postgres',         // Replace with your admin username
  host: '127.0.0.1',        // Replace with your database host
  database: 'user_database',  // Replace with your database name
  password: '325181295', // Replace with your admin password
  port: 5432,               // Default PostgreSQL port
});

/**
 * Function to create a user in PostgreSQL for the microservice
 * @param {string} username - The name of the new user
 * @param {string} password - The password for the new user
 * @param {string} database - The database to connect to
 * @returns {Promise} - A promise that resolves when the user is created
 */
async function createUser(username, password, database) {
    const client = await user_pool.connect();
    
    try {
      // Start a transaction to ensure the user is created properly
      await client.query('BEGIN');
      
      // SQL query to create the new user
      const query = `
        CREATE ROLE ${username} WITH LOGIN PASSWORD '${password}';
        GRANT CONNECT ON DATABASE ${database} TO ${username};
        GRANT USAGE ON SCHEMA public TO ${username};
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${username};
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${username};
      `;
  
      // Execute the query to create the user
      await client.query(query);
  
      // Commit the transaction
      await client.query('COMMIT');
  
      console.log(`User '${username}' created successfully!`);
  
    } catch (err) {
      // In case of error, rollback the transaction
      await client.query('ROLLBACK');
      console.error('Error creating user:', err.stack);
    } finally {
      // Release the client connection
      client.release();
    }
  }
// Define the POST route to create a user
create_user = async (req, res) => {
        const { username, password, database } = req.body;
    
        if (!username || !password || !database) {
        return res.status(400).json({ error: 'Username, password, and database are required' });
        }
    
        try {
        // Call the createUser function
        const message = await createUser(username, password, database);
        return res.status(200).json({ message });
        } catch (error) {
        return res.status(500).json({ error: 'Failed to create user', details: error.message });
        }
    };
    
    
