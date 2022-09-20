import { ArtifactKey } from '~src/Types/gcsim';
import { Artifact } from '~src/Types/types';
import { parseGOOD, StatMapping } from '.';
import { GArtifact } from './good';

export function convert_artifact(artifact: GArtifact): Artifact {
  //@ts-ignore
  const key: ArtifactKey = artifact.setKey.toLowerCase();
  let res: Artifact = {
    key: key,
    slot: artifact.slotKey,
    level: artifact.level,
    main_stat: StatMapping[artifact.mainStatKey],
    substats: artifact.substats,
  };
  if (artifact.location != '') {
    //@ts-ignore
    res.location = parseGOOD(artifact.location);
  }
  return res;
}
