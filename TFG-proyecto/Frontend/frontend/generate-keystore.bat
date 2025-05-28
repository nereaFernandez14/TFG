@echo off
set CERT_PATH=certs
set CERT_FILE=localhost.pem
set KEY_FILE=localhost-key.pem
set OUTPUT=keystore.p12
set BACKEND_KEYSTORE_PATH=C:\Users\cotig\Sources\Repo\AngularProyectos\TFG-proyecto\Backend\ProyectoVersion\demo\src\main\resources
set ALIAS=tomcat
set PASSWORD=123456

echo 🛠️ Generando keystore.p12 desde certificados mkcert...

openssl pkcs12 -export ^
 -in %CERT_PATH%\%CERT_FILE% ^
 -inkey %CERT_PATH%\%KEY_FILE% ^
 -out %OUTPUT% ^
 -name %ALIAS% ^
 -passout pass:%PASSWORD%

if %errorlevel%==0 (
  echo ✅ keystore.p12 generado correctamente.

  echo 🔁 Moviendo keystore.p12 a %BACKEND_KEYSTORE_PATH%...
  move /Y %OUTPUT% "%BACKEND_KEYSTORE_PATH%\%OUTPUT%"

  if %errorlevel%==0 (
    echo ✅ Copia completada con éxito a %BACKEND_KEYSTORE_PATH%.
  ) else (
    echo ⚠️ Error al mover el archivo. ¿La ruta del backend es correcta?
  )
) else (
  echo ❌ Error al generar keystore.p12
)

pause