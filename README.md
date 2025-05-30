curl -X POST -H "Content-Type: application/json" -d '{"name":"Тестовый товар","description":"description test","price":999,"categories":["Тест"]}' http://localhost:8080/api/products

curl -X PUT -H "Content-Type: application/json" -d '{"price":1099}' "http://localhost:8080/api/products?id=1"

curl -X DELETE "http://localhost:8080/api/products?id=6"
