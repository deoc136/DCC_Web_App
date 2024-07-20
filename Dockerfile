FROM 422391363513.dkr.ecr.us-east-1.amazonaws.com/agendaahorawebapp-bo-dev:node-20
WORKDIR /usr/src/app

COPY . .

RUN yarn cache clean

RUN yarn

RUN yarn build

# Copiar el script de construcción al directorio de trabajo y darle permisos para Ejecutar el análisis de SonarQube
#RUN chmod 777 build.sh && ./build.sh 
# análisis de SonarQube
#RUN sonar-scanner

EXPOSE 3000 3000

CMD [ "yarn", "start" ]