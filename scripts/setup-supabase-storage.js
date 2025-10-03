const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variáveis de ambiente do Supabase não encontradas");
  console.log("Certifique-se de configurar:");
  console.log("NEXT_PUBLIC_SUPABASE_URL");
  console.log("SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBuckets() {
  console.log("🚀 Configurando buckets do Supabase Storage...\n");

  const buckets = [
    {
      name: "animals",
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      folders: ["photos", "documents"],
    },
    {
      name: "documents",
      public: false,
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      folders: ["adoption", "medical"],
    },
    {
      name: "profiles",
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 2 * 1024 * 1024, // 2MB
      folders: ["users", "tutors"],
    },
  ];

  for (const bucketConfig of buckets) {
    try {
      console.log(`📦 Configurando bucket: ${bucketConfig.name}`);

      // Verificar se o bucket já existe
      const { data: existingBuckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        console.error(`❌ Erro ao listar buckets:`, listError);
        continue;
      }

      const bucketExists = existingBuckets?.some(
        (bucket) => bucket.name === bucketConfig.name,
      );

      if (bucketExists) {
        console.log(`✅ Bucket "${bucketConfig.name}" já existe`);
      } else {
        // Criar novo bucket
        const { error: createError } = await supabase.storage.createBucket(
          bucketConfig.name,
          {
            public: bucketConfig.public,
            fileSizeLimit: bucketConfig.maxFileSize,
            allowedMimeTypes: bucketConfig.allowedMimeTypes,
          },
        );

        if (createError) {
          console.error(
            `❌ Erro ao criar bucket "${bucketConfig.name}":`,
            createError,
          );
        } else {
          console.log(`✅ Bucket "${bucketConfig.name}" criado com sucesso`);
        }
      }

      // Configurar políticas RLS para o bucket
      await setupBucketPolicies(bucketConfig.name, bucketConfig.public);

      console.log(
        `✅ Configuração do bucket "${bucketConfig.name}" concluída\n`,
      );
    } catch (error) {
      console.error(
        `❌ Erro ao configurar bucket "${bucketConfig.name}":`,
        error,
      );
    }
  }

  console.log("🎉 Configuração do Supabase Storage concluída!");
}

async function setupBucketPolicies(bucketName, isPublic) {
  try {
    // Para buckets públicos, permitir leitura para todos
    if (isPublic) {
      const { error } = await supabase.rpc("create_storage_policy", {
        bucket_name: bucketName,
        policy_name: "Public Read Access",
        policy_def: `(
          bucket_id = '${bucketName}' AND 
          (storage.foldername(name))[1] IS NULL
        )`,
        policy_action: "SELECT",
        policy_roles: "anon,authenticated",
      });

      if (error) {
        console.log(`ℹ️  Política pública já existe ou erro:`, error.message);
      }
    }

    // Política para upload (apenas usuários autenticados)
    const { error: uploadError } = await supabase.rpc("create_storage_policy", {
      bucket_name: bucketName,
      policy_name: "Authenticated Upload Access",
      policy_def: `(
        bucket_id = '${bucketName}' AND 
        auth.role() = 'authenticated'
      )`,
      policy_action: "INSERT",
      policy_roles: "authenticated",
    });

    if (uploadError) {
      console.log(
        `ℹ️  Política de upload já existe ou erro:`,
        uploadError.message,
      );
    }

    // Política para delete (apenas usuários autenticados)
    const { error: deleteError } = await supabase.rpc("create_storage_policy", {
      bucket_name: bucketName,
      policy_name: "Authenticated Delete Access",
      policy_def: `(
        bucket_id = '${bucketName}' AND 
        auth.role() = 'authenticated'
      )`,
      policy_action: "DELETE",
      policy_roles: "authenticated",
    });

    if (deleteError) {
      console.log(
        `ℹ️  Política de delete já existe ou erro:`,
        deleteError.message,
      );
    }
  } catch (error) {
    console.error(
      `❌ Erro ao configurar políticas para "${bucketName}":`,
      error,
    );
  }
}

// Executar configuração
setupStorageBuckets().catch(console.error);
