import * as mongoose from "mongoose";
import * as crypto from "crypto";

export interface User extends mongoose.Document {
  _id: string,
  name: string,
  email: string,
  password: string,
  created: string,
  permissionLevel: number
}

const userSchema = new mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      required: true,
      maxlength: 128,
      minlength: 1
    },
    email: {
      type: String,
      required: true,
      maxlength: 128,
      minlength: 1
    },
    password: {
      type: String,
      required: true,
      maxlength: 128,
      minlength: 128
    },
    created: {
      type: Date,
      default: Date.now()
    },
    permissionLevel: {
      type: Number,
      max: 1
    }
  },
  { collection: "users" }
);

userSchema.path("email").validate(async (value: any) => {
  try {
    let exists = await mongoose.model("users").countDocuments({ email: value });
    return (!exists);
  }
  catch (err) {
    throw err;
  }
}, 'Path `{PATH}` (`{VALUE}`) is not unique.', 'alreadyexists');

export default mongoose.model<User>("users", userSchema);

export const encryptPassword = (decryptedPass: string): string => {
  let encryptedPass = crypto
    .createHash("sha512")
    .update(decryptedPass)
    .digest("hex");
  return encryptedPass;
};
