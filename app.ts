import weaviate from "weaviate-ts-client";

export const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});
(async () => {
  const schemaRes = await client.schema.getter().do();
  console.log({schemaRes});
})();
