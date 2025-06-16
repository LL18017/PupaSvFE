import Docker from 'dockerode';


const docker = new Docker();

// Crear volumen para Postgres si es necesario
const crearPostgres = async () => {
    return docker.createContainer({
      Image: 'postgres:16-alpine',
      name: 'postgres-db-test',
      Env: [
        'POSTGRES_USER=postgres',
        'POSTGRES_PASSWORD=abc123',
        'POSTGRES_DB=Tipicos'
      ],
      HostConfig: {
        AutoRemove: true, // <- efímero
        Binds: [`./test/resources/tipicos_tpi135_2025.sql:/docker-entrypoint-initdb.d/init.sql`],
        PortBindings: {
          '5432/tcp': [{ HostPort: '5432' }]
        }
      }
    });
  };
  



const main = async () => {
  const postgres = await crearPostgres();
  //const liberty = await crearOpenLiberty();

  await postgres.start();
  console.log('📦 PostgreSQL iniciado');


};

main().catch(console.error);
