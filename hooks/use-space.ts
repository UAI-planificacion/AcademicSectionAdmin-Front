import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ENV }                      from "@/config/envs/env";
import { BuildingEnum, SpaceType }  from "@/models/section-session.model";
import { Option, Size, SpaceData }  from "@/lib/types";
import { fetchApi }                 from "@/services_/fetch";
import { KEY_QUERYS }               from "@/lib/key-queries";


export type Skill = {
    floor       : number | null;
    capacity    : number;
    aforo       : number | null;
    mts2        : string | null;
    foto        : string | null;
    num_enchufe : number | null;
    type        : string;
    size        : string;
    min?        : number | null;
    max?        : number | null;
    building    : string;
}


export type LovVal = {
    idlovvals   : number;
    description : string;
    active      : boolean;
    skill       : Skill;
    created_at  : string;
    comment     : string | null
}


export type Space = {
    idlov       : number,
    description : string;
    lov_vals    : LovVal[]  | null;
    created_at  : string    | null;
    skill       : any       | null;
    active      : boolean;
}

// Function to transform cost center data to options format
export const memoizedSpaceData = (
	spaceData : Space | undefined
): Option[] => useMemo(() => {
	return spaceData?.lov_vals?.map( space => ({
		id		: space.idlovvals.toString(),
		label	: space.description,
		value	: space.description,
	})) ?? [];
}, [spaceData]);

// Function to transform space data to flattened format
export const memoizedSpaceDataFlat = (
	spaceData : Space | undefined
): SpaceData[] => useMemo(() => {
	return spaceData?.lov_vals?.map( space => ({
		id			: space.idlovvals.toString(),
		name		: space.description,
		size		: space.skill.size as Size,
		building    : space.skill.building as BuildingEnum,
		type		: space.skill.type as SpaceType,
        capacity    : space.skill.capacity,
	})) ?? [];
}, [spaceData]);

// Interface for hook parameters
interface UseSpaceParams {
	enabled? : boolean;
}

// Interface for hook return values
interface UseSpaceReturn {
	spaces		: Option[];
	spacesData  : SpaceData[];
	isLoading	: boolean;
	isError		: boolean;
	error		: Error | null;
}

/**
 * Custom hook to fetch and manage cost center data
 * @param params - Configuration parameters for the hook
 * @returns Transformed cost center data, loading state, and error information
 */
export const useSpace = ( 
	params : UseSpaceParams = {} 
): UseSpaceReturn => {
	let { enabled } = params;
    const url       = `${ENV.ROOM_SYSTEM_URL}${ENV.ROOM_ENDPOINT}`;

    if ( enabled === undefined ) enabled = true;

	const {
		data,
		isLoading,
		isError,
		error
	} = useQuery<Space>({
		queryKey	: [KEY_QUERYS.SPACES],
		queryFn		: () => fetchApi({ isApi: false, url }),
		enabled,
	});


	return {
		spaces		: memoizedSpaceData( data ),
		spacesData	: memoizedSpaceDataFlat( data ),
		isLoading,
		isError,
		error,
	};
};
