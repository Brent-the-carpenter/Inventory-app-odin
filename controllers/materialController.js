const Category = require("../models/category");
const Material = require("../models/material");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("app:material");

exports.material_list = asyncHandler(async (req, res, next) => {});

exports.material_detail = asyncHandler(async (req, res, next) => {});

exports.material_get_create = asyncHandler(async (req, res, next) => {});

exports.material_post_create = asyncHandler(async (req, res, next) => {});

exports.material_get_delete = asyncHandler(async (req, res, next) => {});

exports.material_post_delete = asyncHandler(async (req, res, next) => {});

exports.material_get_update = asyncHandler(async (req, res, next) => {});

exports.material_post_update = asyncHandler(async (req, res, next) => {});
