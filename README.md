# Kaamelott API

This project aims to serve some quotes from the best French serie: Kaamelott. Quotes mainly came from the fabulous [Wikiquotes](https://fr.wikiquote.org/wiki/Kaamelott) website.

Want a random quote ? Just `curl https://kaamelott.kyane.fr/api/v1/quote/random` !

## API documentation
Currently API is on version 1. Which means that each requests path begin with `/api/v1`.

### GET requests
- `/quote/random`: Return a random quote
- `/quote/:id`: Return a specific quote using its id (UUID value)
- `/character/:id|:name`: Return a character from its name or id (UUID value)
- `/character/:id|:name/random`: Return a random quote from a specific character

### POST requests
- `/quote`: Create a quote (need authentication). Should have the folowing format:
```json
{
	"quote": {
		"text": "Quote text"
	},
	"author": "Author name or id (UUID)"
}
```

### PATCH requests
- `/quote/:id`: Modify a quote (need authentication). Should have the folowing format:
```json
{
	"quote": {
		"text": "Optional field to change the text"
	},
	"author": "Optional field to change the author"
}
```

### DELETE requests
- `/quote/:id`: Delete a quote (need authentication).

## Data model
### Quote
```json
{
	"id": "Unique ID of the quote",
	"quote": {
		"text": "Actual quote"
	},
	"author": {
		"name": "Short/lowercase name of the author. Some sort of author ID",
		"fullName": "Complete name",
		"iconUrl": "URL for the character picture"

	}
}
```

### Character
```json
{
	"id": "Unique ID of the character",
	"character": {
		"name": "Short/lowercase name of the character. Can be use as an ID",
		"fullName": "Complete name",
		"iconUrl": "URL for the character picture"
	}
}
```

## Mattermost Slash command
This API also propose a `/mattermost` endpoint which serve quotes for a Mattermost Slash command. You just have to create a Mattermost Slash command with this configuration:
- request URL `https://kaamelott.kyane.fr/mattermost`
- request method `POST` (**!! `GET` will not work**)

## Deploy
### Database
If you want to host yourself this API, you first need a PostgreSQL database. You can use an existing one, or quickly deploy one with [the official Docker image](https://hub.docker.com/_/postgres/). You can use this docker-compose example:
```yaml
kaapi-db:
  image: postgres:9.6-alpine
  container_name: kaapi-db
  volumes:
    - /path/to/volumes/db:/var/lib/postgresql/data/pgdata
  environment:
    - POSTGRES_DB=kaamelottapi
    - POSTGRES_USER=myuser
    - POSTGRES_PASSWORD=mypassword
    - PGDATA=/var/lib/postgresql/data/pgdata
  restart: always
```

### Configuration
The server need a configuration file. An example is proposed, you should copy it (`cp config.json.example config.json`) and edit it to add:
- database access/credentials
- admin token
- if you use a proxy in front of the application or not
- if you enable or not Mattermost and (optionnal) the authorized token

### Run
To run the server, you just need to install some dependencies (I use yarn) and run the server.
```
yarn install
node server.js
```
It will initialize the database schema (if needed) and listen on port `3000`.  
If you want to populate your database, you can use the `utils/data.json` file, which contain a set of quotes/characters. Just use the `utils/loadJson.js` script like this:
```
cd utils/
node loadJson.js --file data.json
```

**I strongly recommend** to use Docker. You can find a Dockerfile example [on another Git repository](https://framagit.org/pichouk/dockerfiles/blob/master/kaamelottapi/Dockerfile) and use this docker-compose configuration to deploy:
```yaml
kaapi-app:
  image: kaapi-server
  container_name: kaapi-app
  volumes:
    - /path/volumes/kapi/config.json:/code/config.json
  environment:
    - NODE_ENV=production
  links:
    - kaapi-db:postgres
  restart: always
```

## TODO
Some cool improvement for this repository
- Manage character (and images ?) with API
- Test that configuration is ok before starting app
- Write some tests ?
