import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/User.js'

export const register = async (req, res) => {
  try {
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
    })

    const user = await doc.save()

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    )

    const { passwordHash, ...userData } = user._doc

    res.json({ ...userData, token })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to register.',
    })
  }
}

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      email: req.body.email,
    })

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      })
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    )

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Invalid email or password.',
      })
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    )

    await UserModel.updateOne(
      { email: req.body.email },
      { $set: { authAt: Date.now() } }
    )

    const { passwordHash, ...userData } = user._doc

    res.json({ ...userData, token })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to log in.',
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      })
    }

    const { passwordHash, ...userData } = user._doc

    res.json(userData)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access.',
    })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = (await UserModel.find().exec()).map((item) => {
      const { passwordHash, ...userData } = item._doc
      return userData
    })
    res.json(users)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access.',
    })
  }
}

export const remove = async (req, res) => {
  try {
    const userId = req.params.id
    UserModel.findOneAndDelete(
      {
        _id: userId,
      },
      (err, doc) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            message: "Couldn't delete the user.",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: 'User not found',
          })
        }

        res.json({
          success: true,
        })
      }
    )
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access.',
    })
  }
}

export const block = async (req, res) => {
  try {
    const userId = req.params.id
    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        block: true,
      }
    )
    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access.',
    })
  }
}

export const unblock = async (req, res) => {
  try {
    const userId = req.params.id
    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        block: false,
      }
    )
    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'No access.',
    })
  }
}
