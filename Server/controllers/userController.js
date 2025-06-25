const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User=require("../models/User")


const getUsers=async(req,res)=>{
  const users=await User.find()
  if(!users)
    return res.status(400).send('users not found')
  res.json(users)
}

const register= async (req, res) => {
  const { username, email, password ,role} = req.body;
  if(!username||!email||!password)
    return res.status(400).send('username, email and password are required')
  const hash = await bcrypt.hash(password, 10);
  const userRole = role === "admin" ? "admin" : "user";

  const user = User.create({ username, email, password: hash,role:userRole });
  if(!user)
    return res.status(400).send('fail to register')
  return res.json({ msg: 'User registered' });

}

const login=async (req, res) => {
  const { email, password } = req.body;
  if(!email||!password)
    return res.status(400).send(' email and password are required')
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role },  process.env.JWT_SECRET);
  res.json({ token, username: user.username, role:user.role});
}

const updateUser=async (req, res) => {
  const { username,role,email, password ,_id} = req.body;
  const user = await User.findById(_id);
  if (!user)
    return res.status(401).json({ msg: `not found user with id ${_id}` });
if(password){
  const hash = await bcrypt.hash(password, 10);
  user.password=hash
}
  

  user.username=username
  user.role=role
  user.email=email
 

  await user.save()
 
  return res.json(user)

}

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user) return res.status(404).send('User not found');
  res.send('User deleted successfully');
};


module.exports={register,login,updateUser,getUsers,deleteUser}