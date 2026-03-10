import KismetSequence
import random
import numpy as np
import json

seed = 10
np.random.seed(seed)
random.seed(seed)

sequence = KismetSequence.KismetSequence(sequence_file = 'data/gtbbt.seq')
sequence()

sequence.active_module.pretty_print_history()
sequence.active_module.display_statuses()
sequence.active_module.display_relationships()

with open('population.json','w') as outfile:
    outfile.write(json.dumps(sequence.active_module.to_json(), sort_keys=True, indent=4))