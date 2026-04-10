Initialization commands for test data.

Redis (local) - create test user 'demo' with password 'password123':

redis-cli set "user:demo" "password123"

MongoDB (Atlas) - open your mongo shell or use the Atlas UI; replace placeholders:

mongo "mongodb+srv://<user>:<password>@<cluster-url>/tp1" --eval "db.products.insertMany([{
  name: 'Monitor Ultra 27', type: 'monitor', price: 299.99, attributes: { pulgadas: 27, resolucion: '2560x1440' }
},{
  name: 'Teclado Mecánico K100', type: 'teclado', price: 129.99, attributes: { idioma: 'es', switches: 'red' }
},{
  name: 'Procesador Xtreme 8', type: 'procesador', price: 399.99, attributes: { cores: 8, frecuencia: '3.8GHz' }
}])"

Alternatively use the Atlas Data Explorer to insert three documents into the `tp1.products` collection.
