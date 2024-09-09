'use client'

import TagsTable from "@/components/admin/TagsTable";
import { editTag, fetchTags } from "@/redux/slices/configuration/manage-categories/tagSlice";
import { AppDispatch, RootState } from "@/redux/store";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

function page() {

    return (
        <TagsTable />
    )
}

export default page