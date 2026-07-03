import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "design-baseline";

export function Closed() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Select defaultValue="italian">
        <SelectTrigger>
          <SelectValue placeholder="Cuisine" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="italian">Italian</SelectItem>
          <SelectItem value="japanese">Japanese</SelectItem>
          <SelectItem value="mexican">Mexican</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="unlisted" disabled>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unlisted">Unlisted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// OVERRIDE target: open list escapes a static card render — shown open here
// deliberately, flagged in learnings for cardMode:"single".
export function Open() {
  return (
    <div className="flex w-full max-w-xs justify-center pb-56 pt-2">
      <Select defaultValue="medium" open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectGroup>
            <SelectLabel>Difficulty</SelectLabel>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Visibility</SelectLabel>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
