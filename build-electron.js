const builder = require('electron-builder');
const path = require('path');

// Configuración para crear ejecutable portable
const config = {
  appId: 'com.carwash.penablanca',
  productName: 'Carwash Peña Blanca',
  directories: {
    output: 'build'
  },
  extraMetadata: {
    main: 'electron-main.js'
  },
  files: [
    'dist/**/*',
    'electron-main.js',
    'node_modules/**/*',
    '!node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!node_modules/*.d.ts',
    '!node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ],
  win: {
    target: [
      {
        target: 'portable',
        arch: ['x64']
      }
    ]
  },
  portable: {
    artifactName: 'CarwashPenaBlanca-Portable-${version}.exe'
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      }
    ]
  }
};

// Función para construir la aplicación
async function buildApp() {
  try {
    console.log('🚀 Iniciando construcción de la aplicación portable...');
    
    // Construir para Windows portable
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget('portable'),
      config: config
    });
    
    console.log('✅ ¡Aplicación portable creada exitosamente!');
    console.log('📁 Busca el archivo .exe en la carpeta "build"');
    
    return result;
  } catch (error) {
    console.error('❌ Error construyendo la aplicación:', error);
    throw error;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  buildApp();
}

module.exports = { buildApp, config };