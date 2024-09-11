import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import {fileUploadCloudinary, deleteFileFromCloudinary} from "../utils/Fileupload.js"

const generateAccessAndRefreshTokens = async (userId) => {

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiResponse(500, "Some thing went wrong");
    };
};

const registerUser = asyncHandler(async(req, res) => {
    try {
        const {firstName, lastName, email, phoneNumber, dateOfBirth, 
            graduationYear, password, homeAddress, aboutMe} = req.body;

        if (
            [firstName, lastName, password, email, phoneNumber, dateOfBirth, graduationYear, homeAddress, aboutMe].some((fields) => fields?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }
        const checkUserIsAlredyExist = await User.findOne({
            $or: [{ email }, { phoneNumber }]
        })
        if (checkUserIsAlredyExist) {
            throw new ApiError(409, "This email or phoneNumber already exists")
        }
    const profileLocalPath = req.files?.profile[0]?.path;
    if (!profileLocalPath) {
        throw new ApiError(400, "profile is required")
    }
    const profile = await fileUploadCloudinary(profileLocalPath);
    
    if (!profile) {
        throw new ApiError(400, "Profile is required for cloudinary")
    }
    
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        profile: profile.url,
        aboutMe,
        graduationYear,
        dateOfBirth,
        phoneNumber,
        homeAddress,
        password,
    })

    return res.status(200).json(
        new ApiResponse(200, newUser, "User Registered Successfully")
    )

    } catch (error) {
     throw new ApiError(500, error?.message, "Some thing went wrong")   
    }
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        throw new ApiError(400, "Please enter email and password");
    }
    const user = await User.findOne({
        $or: [{ email }, { password }]
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const checkPassword = await user.isPasswordCorrect(password);
    if (!checkPassword) {
        throw new ApiError(401, "Invalid Password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User Logged In Successfully",
        ))
});

const logoutUser = asyncHandler(async (req, res) => {

  try {
      await User.findByIdAndUpdate(
          req.user._id,
          {
              $unset: {
                  refreshToken: 1
              }
          },
          {
              new: true
          }
      )
  
      const options = {
          httpOnly: true,
          secure: true
      }
      return res.status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(
              new ApiResponse(200, {}, "User Logout Successfully")
          )
  } catch (error) {
    throw new ApiError(500, error?.message, "Some thing went wrong")
  }
});


const getUsersData = asyncHandler(async (req, res) => {
    try {
        const users = await User.find(req.user)
        return res.status(200)
            .json(new ApiResponse(
                200,
                users,
                "User Get Successfully"
            ));
    } catch (error) {
        throw new ApiError(500, error?.messege, "Error in Users Fetched from Server")
    }
});

const getUserDataById = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params
        const userGetById = await User.findById(userId)
        return res.status(200)
            .json(new ApiResponse(
                200, userGetById, "This user is Exsist"
            ));
    } catch (error) {
        throw new ApiError(500, error?.messege, "Server Error during User fetched by Id")
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getUsersData,
    getUserDataById
}