import { readFileSync, writeFileSync } from "fs";
import { client } from "./app";

const className: string = "Class";

const createClass = async (className: string) => {
  const schemaConfig = {
    class: `${className}`,
    vectorizer: "img2vec-neural",
    vectorIndexType: "hnsw",
    moduleConfig: {
      "img2vec-neural": {
        imageFields: ["image"],
      },
    },
    properties: [
      {
        name: "image",
        dataType: ["blob"],
      },
      {
        name: "text",
        dataType: ["string"],
      },
    ],
  };

  let allClassDefinitions = await client.schema.getter().do();

  console.log({ allClassDefinitions });

  let flag = -1;
  if (allClassDefinitions.classes) {
    for (const classDef of allClassDefinitions.classes) {
      console.log({ classDef: JSON.stringify(classDef) });
      if (classDef.class === schemaConfig.class) {
        // Class already exists
        console.log(`Class ${schemaConfig.class} already exists`);
        ++flag;
        break;
      }
    }
  }

  if (flag === -1) {
    await client.schema.classCreator().withClass(schemaConfig).do();
  }
};

const getResult = async (imgName: string) => {
  const test = Buffer.from(readFileSync(`./img/${imgName}.jpg`)).toString(
    "base64"
  );

  const resImage = await client.graphql
    .get()
    .withClassName(className)
    .withFields("image")
    .withNearImage({ image: test })
    .withLimit(1)
    .do();

  // Write result to filesystem
  const result = resImage.data.Get.Class[0].image;
  writeFileSync("./result.jpg", result, "base64");
};

const writeImages = async (imgName: string) => {
  const img = readFileSync(`./img/${imgName}.jpg`);

  const b64 = Buffer.from(img).toString("base64");

  await client.data
    .creator()
    .withClassName(className)
    .withProperties({
      image: b64,
      text: "matrix className",
    })
    .do();
};

(async () => {
  await createClass(className);
  const imgNameArray: string[] = [];
  for (let i = 1; i < 10; i++) {
    imgNameArray.push(`${i}`);
  }
  imgNameArray.forEach(async (imgName) => {
    await writeImages(imgName);
  });
  await getResult("2");
})();
