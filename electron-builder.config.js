module.exports = {
  appId: 'com.carwash.penablanca',
  productName: 'Carwash Peña Blanca',
  
  directories: {
    output: 'portable-build'
  },
  
  files: [
    'dist/**/*',
    'electron-main.js',
    'node_modules/**/*'
  ],
  
  win: {
    target: 'portable'
  },
  
  portable: {
    artifactName: 'CarwashPenaBlanca.exe'
  }
};