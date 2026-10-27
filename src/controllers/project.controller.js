import User from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { USerRoleEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        status: "accepted"
      }
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
                  $match: { status: "accepted" }
                },
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
            $match: { status: "accepted" }
          },
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
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id)
  });

  // The creator is automatically an accepted admin member
  await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: USerRoleEnum.ADMIN,
    status: "accepted"
  });

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

    // Also remove all project members when project is deleted
    await ProjectMember.deleteMany({ project: new mongoose.Types.ObjectId(projectId) });

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

// Generate a shareable invitation link for a project
const generateInviteLink = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found...");
    }

    // Generate a unique invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");

    // Store the invitation as a pending record with no specific user yet
    // We use a placeholder ObjectId — this record acts as the "invite slot"
    await ProjectMember.create({
        user: req.user._id, // temporarily store the inviter; will be replaced on accept
        project: new mongoose.Types.ObjectId(projectId),
        role: role || USerRoleEnum.MEMBER,
        status: "pending",
        inviteToken: inviteToken
    });

    // Build the invite URL (frontend URL that the accepting user will visit)
    const frontendBaseUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const inviteUrl = `${frontendBaseUrl}/invite/${projectId}/${inviteToken}`;

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { inviteUrl, inviteToken },
                "Invitation link generated successfully!"
            )
        );
});

// Accept an invitation using a token (the logged-in user joins the project)
const acceptInvitation = asyncHandler(async (req, res) => {
    const { projectId, inviteToken } = req.params;

    // Find the pending invitation record
    const invitation = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        inviteToken: inviteToken,
        status: "pending"
    });

    if (!invitation) {
        throw new ApiError(400, "Invalid or expired invitation link");
    }

    // Check if this user is already an accepted member
    const existingMember = await ProjectMember.findOne({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(projectId),
        status: "accepted"
    });

    if (existingMember) {
        // Delete the pending invitation since user is already a member
        await ProjectMember.findByIdAndDelete(invitation._id);
        throw new ApiError(400, "You are already a member of this project");
    }

    // Update the invitation: assign the accepting user and mark as accepted
    invitation.user = req.user._id;
    invitation.status = "accepted";
    invitation.inviteToken = undefined;
    await invitation.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                invitation,
                "Invitation accepted! You are now a member of this project."
            )
        );
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
      project: new mongoose.Types.ObjectId(projectId),
      status: "accepted"
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
            user : new mongoose.Types.ObjectId(memberId),
            status: "accepted"
        },
        {
            role
        },
        {
            returnDocument: 'after'
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
    generateInviteLink,
    acceptInvitation,
    deleteProject,
    updateProject,
    creatProject,
    getProjectsById
}