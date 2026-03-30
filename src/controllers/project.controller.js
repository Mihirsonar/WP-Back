import User from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import mongoose from "mongoose";
import { USerRoleEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id)    }
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
  $lookup: {
    from: "projectmembers",
    localField: "_id",
    foreignField: "project",
    as: "projectmembers",
    pipeline: [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: "$user._id",
          username: "$user.username"
        }
      }
    ]
  }
},
          {
            $addFields: {
              totalMembers: {
                $size: "$projectmembers"
              }
            }
          }
        ]
      }
    },
    {
      $unwind: "$project"
    },
    {
      $project: {
        _id: "$project._id",
        name: "$project.name",
        description: "$project.description",
        totalMembers: "$project.totalMembers",
        members: "$project.projectmembers",
        createdAt: "$project.createdAt",
        role: 1
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
            "Projects fetched successfully!",
      projects

    )
  );
});

const getProjectsById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $lookup: {
        from: "projectmembers",
        localField: "_id",
        foreignField: "project",
        as: "members",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user"
            }
          },
          { $unwind: "$user" },
          {
            $project: {
              _id: "$user._id",
              username: "$user.username"
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        members: 1
      }
    }
  ]);

  if (!project.length) {
    throw new ApiError(404, "Project not found...");
  }

  return res.status(200).json(
    new ApiResponse(200, "Project fetched successfully!", project[0])
  );
});

const creatProject = asyncHandler(async (req, res) => {
  const { name, description, members = [] } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id)
  });

 
  await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: USerRoleEnum.ADMIN
  });

  const memberDocs = members.map(userId => ({
    user: new mongoose.Types.ObjectId(userId),
    project: project._id,
    role: USerRoleEnum.MEMBER
  }));

  if (memberDocs.length > 0) {
    await ProjectMember.insertMany(memberDocs);
  }

  return res.status(201).json(
    new ApiResponse(201, project, "Project Created Successfully!")
  );
});

const updateProject = asyncHandler (async (req,res)=>{

    const {name,description} = req.body;

    const{projectId} = req.params;

   const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        }
    )
    if(!project){
        throw new ApiError(404,"Project not found...")
    }
    return res
    .status (200)
    .json(
        new ApiResponse(
            200,
            project,
            "Project updated Succcefully!!!"
        )
    )
});

const deleteProject = asyncHandler (async (req,res)=>{

    const {projectId} = req.params;

    const project = await Project.findByIdAndDelete(projectId);

        if(!project){
        throw new ApiError(404,"Project not found...")
    }
    return res
    .status (200)
    .json(
        new ApiResponse(
            200,
            project,
            "Project deleteted Succcefully!!!"
        )
    )

});

const addMemberToProject = asyncHandler (async (req,res)=>{
    const {email,role} = req.body;
    const {projectId} = req.params;

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404,"User not found...")
    }
    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project not found...")
    }
    const existingMember = await ProjectMember.findOne({
        user : new mongoose.Types.ObjectId(user._id),
        project : new mongoose.Types.ObjectId(projectId)
    })
    if(existingMember){
        throw new ApiError(400,"User is already a member of the project...")
    }
    const projectMember = await ProjectMember.create({
        user : new mongoose.Types.ObjectId(user._id),
        project : new mongoose.Types.ObjectId(projectId),
        role : role || USerRoleEnum.MEMBER
    })
    return res
    .status (201)
    .json(
        new ApiResponse(
            201,
            projectMember,
            "Member added to project Succcefully!!!"
        )
    )   
});

const getProjectMembers = asyncHandler (async (req,res)=>{
    const {projectId} = req.params;

    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project not found...")
    }
 const projectMembers = await ProjectMember.aggregate([
  {
    $match: {
      project: new mongoose.Types.ObjectId(projectId)
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1
          }
        }
      ]
    }
  },
  {
    $unwind: "$user"
  },
  {
    $project: {
      _id: 1,
      project: 1,
      role: 1,
      user: 1
    }
  }
]);
    return res
    .status (200)
    .json(
        new ApiResponse(
            200,
            "Project members fetched Succcefully!!!",
            projectMembers,
        )
    )
}); 

const updateMemberRole = asyncHandler (async (req,res)=>{
    const {projectId,memberId} = req.params;
    const {role} = req.body;

    const projectMember = await ProjectMember.findOneAndUpdate(
        {
            project : new mongoose.Types.ObjectId(projectId),
            user : new mongoose.Types.ObjectId(memberId)},
        {
            role
        },
        {
            new : true
        }
    )

    if(!projectMember){
        throw new ApiError(404,"Project member not found...")
    }

    return res
    .status (200)
    .json(
        new ApiResponse(
            200,
            projectMember,
            "Member role updated Succcefully!!!"
        )
    )

});

const deleteMember = asyncHandler (async (req,res)=>{
    const {projectId,memberId} = req.params;

    const projectMember = await ProjectMember.findOneAndDelete(
        {
            project : new mongoose.Types.ObjectId(projectId),
            user : new mongoose.Types.ObjectId(memberId)
        }
    )
    if(!projectMember){
        throw new ApiError(404,"Project member not found...")
    }
    return res
    .status (200)
    .json(
        new ApiResponse(
            200,
            projectMember,
            "Member deleted from project Succcefully!!!"
        )
    )
});

export {
    getProjects,
    deleteMember,
    updateMemberRole,
    getProjectMembers,
    addMemberToProject,
    deleteProject,
    updateProject,
    creatProject,
    getProjectsById
}